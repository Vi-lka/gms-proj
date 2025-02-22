"use server"

import "server-only"

import { type GetFieldsMapsSchema } from "~/lib/validations/fields-maps";
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { and, ilike, inArray, or, eq, count } from "drizzle-orm";
import { companies, fields, fieldsMaps } from "../db/schema";
import { db } from "../db";
import { getRelationOrderBy, orderData } from "../db/utils";
import { unstable_cache } from "~/lib/unstable-cache";
import { getPresignedUrl } from "../s3-bucket/queries";

export async function getFieldsMaps(
  input: GetFieldsMapsSchema,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const offset = (input.page - 1) * input.perPage

      const where = and(
          input.name ? or(
            ilike(fieldsMaps.name, `%${input.name}%`),
            ilike(fieldsMaps.id, `%${input.name}%`),
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

      const { data, total } = await db.transaction(async (tx) => {
        const data = await tx
          .query.fieldsMaps.findMany({
            limit: input.perPage,
            offset,
            where,
            orderBy,
            with: {
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

          const total = await tx
            .select({
              count: count(),
            })
            .from(fieldsMaps)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)

        return {
          data,
          total,
        }
      })

      const validData = await Promise.all(
        data.map(async ({field, ...other}) => {
          const fileUrl = await getPresignedUrl(other.fileId)
          if (fileUrl.error !== null) throw new Error(fileUrl.error)
          return {
            ...other,
            fileUrl: fileUrl.data,
            fieldName: field.name,
            companyId: field.company.id,
            companyName: field.company.name,
          }
      })
      )

      const sortedData = orderData(input.sort, validData)

      const pageCount = Math.ceil(total / input.perPage)
      return { data: sortedData, pageCount }
    } catch (err) {
      console.error(err)
      return { data: [], pageCount: 0 }
    }
  }

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: 60, tags: ["fields", "map_items"] }
  )()

  return result
}