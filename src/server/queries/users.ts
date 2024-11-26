import "server-only"

import { filterColumns } from "~/lib/filter-columns";
import { unstable_cache } from "~/lib/unstable-cache";
import { type GetUsersSchema } from "~/lib/validations/users";
import { type User, users } from "../db/schema";
import {
  gt,
  asc,
  count,
  desc,
} from "drizzle-orm"
import { db } from "../db";
import { type UserRole } from "~/lib/types";

export async function getUsers(
  input: GetUsersSchema,
  role: UserRole
) {
  if (role !== "admin") {
    throw new Error("Don`t have permission");
  }

  const fetchData = async () => {
    try {
      const offset = (input.page - 1) * input.perPage
        
      const advancedWhere = filterColumns({
        table: users,
        filters: input.filters,
        joinOperator: input.joinOperator,
      })

      const where = advancedWhere

      const orderBy =
        input.sort.length > 0
          ? input.sort.map((item) =>
              item.desc ? desc(users[item.id]) : asc(users[item.id])
            )
          : [asc(users.id)]

      const { data, total } = await db.transaction(async (tx) => {
        const data = await tx
          .select()
          .from(users)
          .limit(input.perPage)
          .offset(offset)
          .where(where)
          .orderBy(...orderBy)

        const total = await tx
          .select({
            count: count(),
          })
          .from(users)
          .where(where)
          .execute()
          .then((res) => res[0]?.count ?? 0)

        return {
          data,
          total,
        }
      })

      const pageCount = Math.ceil(total / input.perPage)
      return { data, pageCount }
    } catch (err) {
      console.error(err)
      return { data: [], pageCount: 0 }
    }
  }

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: 3600, tags: ["users"] }
  )()

  return result
}

export async function getUserRolesCounts(role: UserRole) {
  if (role !== "admin") {
    throw new Error("Don`t have permission");
  }

  const fetchData = async () => {
    try {
      const data = await db
        .select({
          role: users.role,
          count: count(),
        })
        .from(users)
        .groupBy(users.role)
        .having(gt(count(), 0))
        .then((res) =>
          res.reduce(
            (acc, { role, count }) => {
              acc[role] = count
              return acc
            },
            {} as Record<User["role"], number>
          )
        )
      return data
    } catch (err) {
      console.error(err)
      return {} as Record<User["role"], number>
    }
  }

  const result = await unstable_cache(
    fetchData,
    ["user-roles-counts"],
    { revalidate: 3600, tags: ["users", "user-roles-counts"] }
  )()

  return result
}