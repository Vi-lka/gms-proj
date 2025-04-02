"use server"

import "server-only"

import { type GetFieldsMapsSchema } from "~/lib/validations/fields-maps";
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { and, ilike, inArray, or, gt, eq, count, type SQL, getTableColumns } from "drizzle-orm";
import { companies, type Field, type FieldMap, type FieldMapWithUrl, fields, fieldsMaps, users } from "../db/schema";
import { db } from "../db";
import { getOrderBy, serializeWhere } from "../db/utils";
import { unstable_cache } from "~/lib/unstable-cache";
import { getPresignedUrl } from "../s3-bucket/queries";
import { getErrorMessage } from "~/lib/handle-error";
import { type GetAllQueryParams } from "~/lib/types";
import { alias } from "drizzle-orm/pg-core";
import * as Sentry from "@sentry/nextjs";

export async function getFieldsMaps(
  input: GetFieldsMapsSchema,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const usersUpdated = alias(users, 'users_updated');

      const offset = (input.page - 1) * input.perPage

      const whereConditions: (SQL | undefined)[] = [];


      if (input.id) {
        whereConditions.push(or(
          eq(fieldsMaps.id, input.id),
          eq(fields.id, input.id),
          eq(companies.id, input.id),
        ));
      }
      if (input.name) {
        whereConditions.push(or(
          ilike(fieldsMaps.id, `%${input.name}%`),
          ilike(fieldsMaps.name, `%${input.name}%`),
          ilike(fields.id, `%${input.name}%`),
          ilike(fields.name, `%${input.name}%`),
          ilike(companies.id, `%${input.name}%`),
          ilike(companies.name, `%${input.name}%`),
          ilike(users.id, `%${input.name}%`),
          ilike(users.name, `%${input.name}%`),
          ilike(usersUpdated.id, `%${input.name}%`),
          ilike(usersUpdated.name, `%${input.name}%`),
        ));
      }
      if (input.fieldId) {
        whereConditions.push(eq(fields.id, input.fieldId));
      }
      if (input.fieldName) {
        const fieldsInputs = input.fieldName.split(',');
        whereConditions.push(or(
          ilike(fields.name, `%${input.fieldName}%`),
          inArray(fields.id, fieldsInputs),
          inArray(fields.name, fieldsInputs)
        ));
      }
      if (input.companyId) {
        whereConditions.push(eq(companies.id, input.companyId));
      }
      if (input.companyName) {
        const companiesInputs = input.companyName.split(',');
        whereConditions.push(or(
          ilike(companies.name, `%${input.companyName}%`),
          inArray(companies.id, companiesInputs),
          inArray(companies.name, companiesInputs)
        ));
      }

      const orderBy = getOrderBy({
        config: [
          { key: 'createUserName', column: users.name },
          { key: 'updateUserName', column: usersUpdated.name },
          { key: 'fieldName', column: fields.name },
          { key: 'companyId', column: companies.id },
          { key: 'companyName', column: companies.name },
        ], 
        sortInput: input.sort, 
        defaultColumn: fields.name,
        table: fieldsMaps
      });

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data = await tx
          .select({
            ...getTableColumns(fieldsMaps),
            fieldName: fields.name,
            companyId: companies.id,
            companyName: companies.name,
            createUserName: users.name,
            updateUserName: usersUpdated.name,
          })
          .from(fieldsMaps)
          .limit(input.perPage)
          .offset(offset)
          .leftJoin(users, eq(fieldsMaps.createUserId, users.id))
          .leftJoin(usersUpdated, eq(fieldsMaps.updateUserId, usersUpdated.id))
          .innerJoin(fields, eq(fieldsMaps.fieldId, fields.id))
          .innerJoin(companies, eq(fields.companyId, companies.id))
          .where(and(...whereConditions))
          .orderBy(...orderBy)
  
        const total = await tx
          .select({ 
            count: count() 
          })
          .from(fieldsMaps)
          .leftJoin(users, eq(fieldsMaps.createUserId, users.id))
          .leftJoin(usersUpdated, eq(fieldsMaps.updateUserId, usersUpdated.id))
          .innerJoin(fields, eq(fieldsMaps.fieldId, fields.id))
          .innerJoin(companies, eq(fields.companyId, companies.id))
          .where(and(...whereConditions))
          .execute()
          .then((res) => res[0]?.count ?? 0)
    
        const pageCount = Math.ceil(total / input.perPage);

        return {
          data,
          pageCount,
        }
      })

      return { data, pageCount, error: null }
    } catch (err) {
      Sentry.captureException(err);
      console.error(err)
      return { data: [], pageCount: 0, error: getErrorMessage(err) }
    }
  }

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: false, tags: ["fields_maps", "companies", "fields"] }
  )()

  const dataWithUrls: FieldMapWithUrl[] = await Promise.all(
    result.data.map(async (fieldMap) => {
      const fileUrl = await getPresignedUrl(fieldMap.fileId)
      if (fileUrl.error !== null) throw new Error(fileUrl.error)
      return {
        ...fieldMap,
        fileUrl: fileUrl.data,
      }
    })
  )

  return {
    data: dataWithUrls,
    pageCount: result.pageCount,
    error: result.error
  }
}

export async function getFieldMap(
  id: string,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db
        .query.fieldsMaps.findFirst({
          with: {
            polygons: {
              with: { area: true }
            },
            field: {
              with: { company: true }
            }
          },
          where(fields, operators) {
            return operators.eq(fields.id, id)
          },
        })

      if (!data)  return {
        data: null,
        error: "Not Found",
      }

      return {
        data,
        error: null
      }
    } catch (err) {
      Sentry.captureException(err);
      console.error(err)
      return {
        data: null,
        error: getErrorMessage(err),
      }
    }
  }

  const result = await unstable_cache(
    fetchData,
    [id],
    { revalidate: false, tags: ["fields_maps", "companies", "fields", "licensed_areas", "polygons"] }
  )()

  return result
}

export async function getFieldMapWithImage(id: string) {
  const result = await getFieldMap(id)

  if (result.error !== null) return {
    data: null,
    error: result.error
  }

  const fileUrl = await getPresignedUrl(result.data.fileId)

  if (fileUrl.error !== null) return {
    data: null,
    error: fileUrl.error
  }

  const validData = {
    ...result.data,
    fileUrl: fileUrl.data,
  }

  return {
    data: validData,
    error: null
  }
}

export async function getFieldMapsCounts() {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db
        .select({
          fieldId: fieldsMaps.fieldId,
          count: count(),
        })
        .from(fieldsMaps)
        .groupBy(fieldsMaps.fieldId)
        .having(gt(count(), 0))
        .then((res) =>
          res.reduce(
            (acc, { fieldId, count }) => {
              acc[fieldId] = count
              return acc
            },
            {} as Record<FieldMap["fieldId"], number>
          )
        )
      return data
    } catch (err) {
      Sentry.captureException(err);
      console.error(err)
      return {} as Record<FieldMap["fieldId"], number>
    }
  }

  const result = await unstable_cache(
    fetchData,
    ["field-maps-counts"],
    { revalidate: false, tags: ["fields_maps"] }
  )()

  return result
}

export async function getCompanyFieldsMapsCounts() {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db
        .select({
          companyId: fields.companyId,
          count: count(),
        })
        .from(fieldsMaps)
        .leftJoin(fields, eq(fieldsMaps.fieldId, fields.id))
        .groupBy(fields.companyId)
        .having(gt(count(), 0))
        .then((res) =>
          res.reduce(
            (acc, { companyId, count }) => {
              if (companyId !== null) {
                acc[companyId] = count;
              }
              return acc;
            },
            {} as Record<Field["companyId"], number>
          )
        );
      return data;
    } catch (err) {
      Sentry.captureException(err);
      console.error(err);
      return {} as Record<Field["companyId"], number>;
    }
  };

  const result = await unstable_cache(
    fetchData,
    ["company-fields-maps-counts"],
    { revalidate: false, tags: ["fields_maps", "fields"] }
  )();

  return result;
}

export async function getAllFieldsMaps(params?: GetAllQueryParams) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db.query.fieldsMaps.findMany({
        where: params?.where,
        orderBy(fields, operators) {
          return operators.asc(fields.fieldId)
        },
      })

      return { data, error: null }
    } catch (err) {
      Sentry.captureException(err);
      console.error(err)
      return { data: [], error: getErrorMessage(err) }
    }
  }

  let whereKey = ""

  // I`am not sure if 'serializeWhere' will work with any 'where', so use keys just in case
  try {
    whereKey = serializeWhere(params?.where)
  } catch (err) {
    Sentry.captureException(err);
    console.error(err)
    if (params) whereKey = params.keys.join(',')
  }

  const result = await unstable_cache(
    fetchData,
    [`fields_maps-${whereKey}`],
    { revalidate: false, tags: ["fields_maps"] }
  )()
  
  return result
}