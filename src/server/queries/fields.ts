"use server"

import "server-only"

import { type GetFieldsSchema } from "~/lib/validations/fields";
import { auth } from "../auth";
import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { companies, fields, users } from "../db/schema";
import { getRelationOrderBy, orderData, paginate } from "../db/utils";
import { db } from "../db";
import { unstable_cache } from "~/lib/unstable-cache";
import { restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";

export async function getFields(
  input: GetFieldsSchema,
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
            ilike(fields.name, `%${input.name}%`),
            ilike(fields.id, `%${input.name}%`),
            inArray(
              fields.createUserId,
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
              fields.updateUserId,
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
              fields.companyId,
              db
                .select({ id: companies.id })
                .from(companies)
                .where(
                  or(
                    ilike(companies.name, `%${input.name}%`),
                    ilike(companies.id, `%${input.name}%`)
                  )
                )
            )
          ) : undefined,
          input.companyId ? (
            inArray(
              fields.companyId,
              db
                .select({ id: companies.id })
                .from(companies)
                .where(eq(companies.id, input.companyId))
            )
          ) : undefined
        )

      const { orderBy } = getRelationOrderBy(input.sort, fields, fields.id)

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data = await tx
          .query.fields.findMany({
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
              company: {
                columns: {
                  id: true,
                  name: true
                }
              }
            }
          })

        // const total = await tx
        //   .select({
        //     count: count(),
        //   })
        //   .from(fields)
        //   .where(where)
        //   .execute()
        //   .then((res) => res[0]?.count ?? 0)

        const transformData = data.map(({company, userCreated, userUpdated, ...other}) => ({
          ...other,
          createUserName: userCreated ? userCreated.name : null,
          updateUserName: userUpdated ? userUpdated.name : null,
          companyName: company.name
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
    { revalidate: 60, tags: ["fields", "map_items"] }
  )()

  return result
}