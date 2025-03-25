"use server"

import "server-only"

import { type GetLicensedAreasSchema } from "~/lib/validations/licensed-areas";
import { auth } from "../auth";
import { and, count, eq, gt, ilike, inArray, or } from "drizzle-orm";
import { companies, type Field, fields, type LicensedArea, licensedAreas, users } from "../db/schema";
import { db } from "../db";
import { getRelationOrderBy, orderData, paginate, serializeWhere } from "../db/utils";
import { unstable_cache } from "~/lib/unstable-cache";
import { restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { type GetAllQueryParams } from "~/lib/types";

export async function getLicensedAreas(
  input: GetLicensedAreasSchema,
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
            ilike(licensedAreas.name, `%${input.name}%`),
            ilike(licensedAreas.id, `%${input.name}%`),
            inArray(
              licensedAreas.createUserId,
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
              licensedAreas.updateUserId,
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
              licensedAreas.fieldId,
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
              licensedAreas.fieldId,
              db
                .select({ id: fields.id })
                .from(fields)
                .where(eq(fields.id, input.fieldId))
            )
          ) : undefined,
          input.fieldName ? (
            inArray(
              licensedAreas.fieldId,
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
              licensedAreas.fieldId,
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
              licensedAreas.fieldId,
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

      const { orderBy } = getRelationOrderBy(input.sort, licensedAreas, licensedAreas.id)

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data = await tx
          .query.licensedAreas.findMany({
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
        //   .from(licensedAreas)
        //   .where(where)
        //   .execute()
        //   .then((res) => res[0]?.count ?? 0)

        const transformData = data.map(({field, userCreated, userUpdated, ...other}) => ({
          ...other,
          createUserName: userCreated ? userCreated.name : null,
          updateUserName: userUpdated ? userUpdated.name : null,
          fieldName: field.name,
          companyId: field.company.id,
          companyName: field.company.name,
        }))
  
        const sortedData = orderData(input.sort, transformData)

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