import { type GetFieldsSchema } from "~/lib/validations/fields";
import { auth } from "../auth";
import { and, count, eq, ilike, inArray, or } from "drizzle-orm";
import { clusters, companies, fields } from "../db/schema";
import { getRelationOrderBy, orderData } from "../db/utils";
import { db } from "../db";
import { unstable_cache } from "~/lib/unstable-cache";

export async function getFields(
  input: GetFieldsSchema,
) {
  const session = await auth();
  if (session?.user.role !== "admin") {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const offset = (input.page - 1) * input.perPage

      const where = and(
          input.name ? or(
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
                    inArray(
                      companies.clusterId,
                      db
                        .select({ id: clusters.id })
                        .from(clusters)
                        .where(
                          or(
                            ilike(clusters.name, `%${input.name}%`),
                            ilike(clusters.id, `%${input.name}%`),
                          )
                        )
                    ),
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
          ) : undefined,
          input.clusterId ? (
            inArray(
              fields.companyId,
              db
                .select({ id: companies.id })
                .from(companies)
                .where(
                    inArray(
                      companies.clusterId,
                      db
                        .select({ id: clusters.id })
                        .from(clusters)
                        .where(eq(clusters.id, input.clusterId))
                    ),
                )
            )
          ) : undefined
        )

      const { orderBy } = getRelationOrderBy(input.sort, fields, fields.id)

      const { data, total } = await db.transaction(async (tx) => {
        const data = await tx
          .query.fields.findMany({
            limit: input.perPage,
            offset,
            where,
            orderBy,
            with: {
              company: {
                columns: {
                  id: true,
                  name: true
                },
                with: {
                  cluster: {
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
            .from(fields)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)

        return {
          data,
          total,
        }
      })

      const transformData = data.map(({company, ...other}) => ({
        ...other,
        companyName: company.name,
        clusterId: company.cluster?.id ?? null,
        clusterName: company.cluster?.name ?? null
      }))

      const sortedData = orderData(input.sort, transformData)

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