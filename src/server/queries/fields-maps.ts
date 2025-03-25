"use server"

import "server-only"

import { type GetFieldsMapsSchema } from "~/lib/validations/fields-maps";
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { and, ilike, inArray, or, gt, eq, count } from "drizzle-orm";
import { companies, type Field, type FieldMap, fields, fieldsMaps, users } from "../db/schema";
import { db } from "../db";
import { getRelationOrderBy, orderData, paginate, serializeWhere } from "../db/utils";
import { unstable_cache } from "~/lib/unstable-cache";
import { getPresignedUrl } from "../s3-bucket/queries";
import { getErrorMessage } from "~/lib/handle-error";
import { type GetAllQueryParams } from "~/lib/types";

export async function getFieldsMaps(
  input: GetFieldsMapsSchema,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      // const offset = (input.page - 1) * input.perPage
      const companiesInputs = input.companyName.split(',');
      const fieldsInputs = input.fieldName.split(',');

      const where = and(
          input.name ? or(
            ilike(fieldsMaps.name, `%${input.name}%`),
            ilike(fieldsMaps.id, `%${input.name}%`),
            inArray(
              fieldsMaps.createUserId,
              db
                .select({ id: users.id })
                .from(users)
                .where(
                  or(
                    ilike(users.name, `%${input.name}%`),
                    ilike(users.id, `%${input.name}%`),
                  )
                )
            ),
            inArray(
              fieldsMaps.updateUserId,
              db
                .select({ id: users.id })
                .from(users)
                .where(
                  or(
                    ilike(users.name, `%${input.name}%`),
                    ilike(users.id, `%${input.name}%`),
                  )
                )
            ),
            inArray(
              fieldsMaps.fieldId,
              db
                .select({ id: fields.id })
                .from(fields)
                .where(
                  or(
                    ilike(fields.name, `%${input.name}%`),
                    ilike(fields.id, `%${input.name}%`),
                    inArray(
                      fields.companyId,
                      db
                        .select({ id: companies.id })
                        .from(companies)
                        .where(
                          or(
                            ilike(companies.name, `%${input.name}%`),
                            ilike(companies.id, `%${input.name}%`),
                          )
                        )
                    ),
                  )
                )
            )
          ) : undefined,
          input.fieldId ? (
            inArray(
              fieldsMaps.fieldId,
              db
                .select({ id: fields.id })
                .from(fields)
                .where(eq(fields.id, input.fieldId))
            )
          ) : undefined,
          input.fieldName ? (
            inArray(
              fieldsMaps.fieldId,
              db
                .select({ id: fields.id })
                .from(fields)
                .where(or(
                  ilike(fields.name, `%${input.fieldName}%`),
                  inArray(fields.id, fieldsInputs),
                  inArray(fields.name, fieldsInputs)
                ))
            )
          ) : undefined,
          input.companyId ? (
            inArray(
              fieldsMaps.fieldId,
              db
                .select({ id: fields.id })
                .from(fields)
                .where(
                  inArray(
                    fields.companyId,
                    db
                      .select({ id: companies.id })
                      .from(companies)
                      .where(eq(companies.id, input.companyId),)
                  ),
                )
            )
          ) : undefined,
          input.companyName ? (
            inArray(
              fieldsMaps.fieldId,
              db
                .select({ id: fields.id })
                .from(fields)
                .where(
                  inArray(
                    fields.companyId,
                    db
                      .select({ id: companies.id })
                      .from(companies)
                      .where(or(
                        ilike(companies.name, `%${input.companyName}%`),
                        inArray(companies.id, companiesInputs),
                        inArray(companies.name, companiesInputs)
                      ))
                  ),
                )
            )
          ) : undefined
        )

      const { orderBy } = getRelationOrderBy(input.sort, fieldsMaps, fieldsMaps.id)

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data = await tx
          .query.fieldsMaps.findMany({
            // limit: input.perPage,
            // offset,
            where,
            orderBy,
            with: {
              userCreated: {
                columns: { name: true }
              },
              userUpdated: {
                columns: { name: true }
              },
              field: {
                columns: {
                  id: true,
                  name: true
                },
                with: {
                  company: {
                    columns: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          })

        // const total = await tx
        //   .select({
        //     count: count(),
        //   })
        //   .from(fieldsMaps)
        //   .where(where)
        //   .execute()
        //   .then((res) => res[0]?.count ?? 0)

        const validData = data.map(({field, userCreated, userUpdated, ...other}) => ({
            ...other,
            createUserName: userCreated ? userCreated.name : null,
            updateUserName: userUpdated ? userUpdated.name : null,
            fieldName: field.name,
            companyId: field.company.id,
            companyName: field.company.name,
          })
        )
  
        const sortedData = orderData(input.sort, validData)

        const paginated = paginate(sortedData, input)

        return {
          data: paginated.items,
          pageCount: paginated.totalPages,
        }
      })

      return { data, pageCount, error: null }
    } catch (err) {
      console.error(err)
      return { data: [], pageCount: 0, error: getErrorMessage(err) }
    }
  }

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: false, tags: ["fields_maps", "companies", "fields"] }
  )()

  const dataWithUrls = await Promise.all(
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
    [`fields_maps-${whereKey}`],
    { revalidate: false, tags: ["fields_maps"] }
  )()
  
  return result
}