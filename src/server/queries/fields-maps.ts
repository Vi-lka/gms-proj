"use server"

import "server-only"

import { type GetFieldsMapsSchema } from "~/lib/validations/fields-maps";
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { and, ilike, inArray, or, eq } from "drizzle-orm";
import { companies, fields, fieldsMaps, users } from "../db/schema";
import { db } from "../db";
import { getRelationOrderBy, orderData, paginate } from "../db/utils";
import { unstable_cache } from "~/lib/unstable-cache";
import { getPresignedUrl } from "../s3-bucket/queries";
import { getErrorMessage } from "~/lib/handle-error";

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

        const validData = await Promise.all(
          data.map(async ({field, userCreated, userUpdated, ...other}) => {
            const fileUrl = await getPresignedUrl(other.fileId)
            if (fileUrl.error !== null) throw new Error(fileUrl.error)
            return {
              ...other,
              createUserName: userCreated ? userCreated.name : null,
              updateUserName: userUpdated ? userUpdated.name : null,
              fileUrl: fileUrl.data,
              fieldName: field.name,
              companyId: field.company.id,
              companyName: field.company.name,
            }
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
    { revalidate: 60, tags: ["fields", "map_items"] }
  )()

  return result
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
    { revalidate: 60, tags: ["fields", "map_items"] }
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