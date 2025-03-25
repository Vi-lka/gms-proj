"use server"

import "server-only"
import { type GetCompaniesSchema } from "~/lib/validations/companies"
import { auth } from "../auth";
import { and, eq, ilike, inArray, or } from "drizzle-orm";
import { companies, users } from "../db/schema";
import { getRelationOrderBy, orderData, paginate, serializeWhere } from "../db/utils";
import { db } from "../db";
import { unstable_cache } from "~/lib/unstable-cache";
import { restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { type GetAllQueryParams } from "~/lib/types";

export async function getCompanies(
  input: GetCompaniesSchema,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const where = and(
        input.name ? or(
          ilike(companies.name, `%${input.name}%`),
          ilike(companies.id, `%${input.name}%`),
          inArray(
            companies.createUserId,
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
            companies.updateUserId,
            db
              .select({ id: users.id })
              .from(users)
              .where(
                or(
                  ilike(users.name, `%${input.name}%`),
                  ilike(users.id, `%${input.name}%`),
                )
              )
          )
        ) : undefined,
        input.id ?
          eq(companies.id, input.id) 
          : undefined
      )
  
      const { orderBy } = getRelationOrderBy(input.sort, companies, companies.id)

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data = await tx
          .query.companies.findMany({
            // limit: input.perPage,
            // offset,
            where,
            with: {
              userCreated: {
                columns: { name: true }
              },
              userUpdated: {
                columns: { name: true }
              }
            },
            orderBy
          })

        // const total = await tx
        //   .select({
        //     count: count(),
        //   })
        //   .from(companies)
        //   .where(where)
        //   .execute()
        //   .then((res) => res[0]?.count ?? 0)

        const transformData = data.map(({userCreated, userUpdated, ...other}) => ({
          ...other,
          createUserName: userCreated ? userCreated.name : null,
          updateUserName: userUpdated ? userUpdated.name : null,
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
    { revalidate: false, tags: ["companies"] }
  )()
  
  return result
}

export async function getAllCompanies(params?: GetAllQueryParams) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db.query.companies.findMany({
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
    [`companies-${whereKey}`],
    { revalidate: false, tags: ["companies"] }
  )()
  
  return result
}