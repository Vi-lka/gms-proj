"use server"

import "server-only"
import { type GetCompaniesSchema } from "~/lib/validations/companies"
import { auth } from "../auth";
import { and, count, eq, ilike, or } from "drizzle-orm";
import { companies } from "../db/schema";
import { getRelationOrderBy, orderData } from "../db/utils";
import { db } from "../db";
import { unstable_cache } from "~/lib/unstable-cache";
import { restrictUser } from "~/lib/utils";

export async function getCompanies(
  input: GetCompaniesSchema,
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
            ilike(companies.name, `%${input.name}%`),
            ilike(companies.id, `%${input.name}%`),
          ) : undefined,
          input.id ?
            eq(companies.id, input.id) 
            : undefined
        )
  
        const { orderBy } = getRelationOrderBy(input.sort, companies, companies.id)
  
        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .query.companies.findMany({
              limit: input.perPage,
              offset,
              where,
              orderBy
            })
  
          const total = await tx
            .select({
              count: count(),
            })
            .from(companies)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)
  
          return {
            data,
            total,
          }
        })
  
        const sortedData = orderData(input.sort, data)
  
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
      { revalidate: 60, tags: ["map_items"] }
    )()
  
    return result
}

