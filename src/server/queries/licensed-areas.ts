"use server"

import "server-only"

import { type GetLicensedAreasSchema } from "~/lib/validations/licensed-areas";
import { auth } from "../auth";
import { and, count, eq, getTableColumns, gt, ilike, inArray, or, type SQL } from "drizzle-orm";
import { companies, type Field, fields, type LicensedArea, type LicensedAreaExtend, licensedAreas, users } from "../db/schema";
import { db } from "../db";
import { getOrderBy, serializeWhere } from "../db/utils";
import { unstable_cache } from "~/lib/unstable-cache";
import { restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { type GetAllQueryParams } from "~/lib/types";
import { alias } from "drizzle-orm/pg-core";

export async function getLicensedAreas(input: GetLicensedAreasSchema) {
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
          eq(licensedAreas.id, input.id),
          eq(fields.id, input.id),
          eq(companies.id, input.id),
        ));
      }
      if (input.name) {
        whereConditions.push(or(
          ilike(licensedAreas.id, `%${input.name}%`),
          ilike(licensedAreas.name, `%${input.name}%`),
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
        defaultColumn: licensedAreas.name,
        table: licensedAreas
      });

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data: LicensedAreaExtend[] = await tx
          .select({
            ...getTableColumns(licensedAreas),
            fieldName: fields.name,
            companyId: companies.id,
            companyName: companies.name,
            createUserName: users.name,
            updateUserName: usersUpdated.name,
          })
          .from(licensedAreas)
          .limit(input.perPage)
          .offset(offset)
          .leftJoin(users, eq(licensedAreas.createUserId, users.id))
          .leftJoin(usersUpdated, eq(licensedAreas.updateUserId, usersUpdated.id))
          .innerJoin(fields, eq(licensedAreas.fieldId, fields.id))
          .innerJoin(companies, eq(fields.companyId, companies.id))
          .where(and(...whereConditions))
          .orderBy(...orderBy)
  
        const total = await tx
          .select({ 
            count: count() 
          })
          .from(licensedAreas)
          .leftJoin(users, eq(licensedAreas.createUserId, users.id))
          .leftJoin(usersUpdated, eq(licensedAreas.updateUserId, usersUpdated.id))
          .innerJoin(fields, eq(licensedAreas.fieldId, fields.id))
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
  
      return {
        data,
        pageCount,
        error: null
      };
    } catch (err) {
      console.error(err);
      return {
        data: [],
        pageCount: 0,
        error: getErrorMessage(err)
      };
    }
  }

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: false, tags: ["licensed_areas", "companies", "fields"] }
  )()

  return result
}

export async function getFieldLicensedAreasCounts() {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db
        .select({
          fieldId: licensedAreas.fieldId,
          count: count(),
        })
        .from(licensedAreas)
        .groupBy(licensedAreas.fieldId)
        .having(gt(count(), 0))
        .then((res) =>
          res.reduce(
            (acc, { fieldId, count }) => {
              acc[fieldId] = count
              return acc
            },
            {} as Record<LicensedArea["fieldId"], number>
          )
        )
      return data
    } catch (err) {
      console.error(err)
      return {} as Record<LicensedArea["fieldId"], number>
    }
  }

  const result = await unstable_cache(
    fetchData,
    ["field-licensed-areas-counts"],
    { revalidate: false, tags: ["licensed_areas"] }
  )()

  return result
}

export async function getCompanyLicensedAreasCounts() {
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
        .from(licensedAreas)
        .leftJoin(fields, eq(licensedAreas.fieldId, fields.id))
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
      console.error(err);
      return {} as Record<Field["companyId"], number>;
    }
  };

  const result = await unstable_cache(
    fetchData,
    ["company-licensed-areas-counts"],
    { revalidate: false, tags: ["licensed_areas", "fields"] }
  )();

  return result;
}

export async function getAllLicensedAreas(params?: GetAllQueryParams) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db.query.licensedAreas.findMany({
        where: params?.where,
        orderBy(fields, operators) {
          return operators.asc(fields.name)
        },
      })

      return { data, error: null }
    } catch (err) {
      console.error(err)
      return { data: [], error: getErrorMessage(err) }
    }
  }

  let whereKey = ""

  // I`am not sure if 'serializeWhere' will work with any 'where', so use keys just in case
  try {
    whereKey = serializeWhere(params?.where)
  } catch (error) {
    console.error(error)
    if (params) whereKey = params.keys.join(',')
  }

  const result = await unstable_cache(
    fetchData,
    [`licensed_areas-${whereKey}`],
    { revalidate: false, tags: ["licensed_areas"] }
  )()
  
  return result
}