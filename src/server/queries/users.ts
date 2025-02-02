"use server"

import "server-only"

import { unstable_cache } from "~/lib/unstable-cache";
import { type GetSessionsSchema, type GetUsersSchema } from "~/lib/validations/users";
import { sessions, type User, users } from "../db/schema";
import {
  gt,
  asc,
  count,
  desc,
  and,
  ilike,
  inArray,
  or,
} from "drizzle-orm"
import { db } from "../db";
import { auth } from "../auth";
import { getRelationOrderBy, orderData } from "../db/utils";
import { restrictUser } from "~/lib/utils";

export async function getUsers(
  input: GetUsersSchema,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel-users')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const offset = (input.page - 1) * input.perPage

      const where = and(
          input.name ? or(
            ilike(users.name, `%${input.name}%`),
            ilike(users.id, `%${input.name}%`)
          ) : undefined,
          input.role.length > 0
            ? inArray(users.role, input.role)
            : undefined,
        )

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
    { revalidate: 60, tags: ["users"] }
  )()

  return result
}

export async function getUserRolesCounts() {
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel-users')) {
    throw new Error("No access");
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
    { revalidate: 60, tags: ["users", "user-roles-counts"] }
  )()

  return result
}


export async function getSessions(
  input: GetSessionsSchema,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel-users')) {
    throw new Error("No access");
  }

  const currentDate = new Date()

  const fetchData = async () => {
    try {
      const offset = (input.page - 1) * input.perPage

      const where = and(
        gt(sessions.expires, currentDate),
        input.userId ? ilike(sessions.userId, `%${input.userId}%`) : undefined,
        input.name ? or(
          inArray(
            sessions.userId,
            db
              .select({ id: users.id })
              .from(users)
              .where(
                and(
                  ilike(users.name, `%${input.name}%`),
                )
              )
          ),
          ilike(sessions.userId, `%${input.name}%`)
        ) : undefined,
        input.role.length > 0
          ? inArray(
            sessions.userId,
            db
              .select({ id: users.id })
              .from(users)
              .where(
                and(
                  inArray(users.role, input.role)
                )
              )
          )
          : undefined,
      )

      const { orderBy } = getRelationOrderBy(input.sort, sessions, sessions.userId)

      const { data, total } = await db.transaction(async (tx) => {

        const data = await tx
          .query.sessions.findMany({
            limit: input.perPage,
            offset,
            where,
            orderBy,
            with: {
              user: {
                columns: {
                  name: true,
                  email: true,
                  role: true,
                }
              }
            }
          })

        const total = await tx
          .select({
            count: count(),
          })
          .from(sessions)
          .where(where)
          .execute()
          .then((res) => res[0]?.count ?? 0)

        return {
          data,
          total,
        }
      })

      const transformData = data.map(item => ({
        userId: item.userId,
        sessionToken: item.sessionToken,
        expires: item.expires,
        name: item.user.name,
        email: item.user.email,
        role: item.user.role
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
    { revalidate: 60, tags: ["users"] }
  )()

  return result
}

export async function getSessionRolesCounts() {
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel-users')) {
    throw new Error("No access");
  }

  const currentDate = new Date()

  const where = and(
    inArray(
      users.id,
      db
        .select({ userId: sessions.userId })
        .from(sessions)
        .where(
          and(
            gt(sessions.expires, currentDate)
          )
        )
    )
  )

  const fetchData = async () => {

    try {
      const data = await db
        .select({
          role: users.role,
          count: count(),
        })
        .from(users)
        .where(where)
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
    { revalidate: 60, tags: ["users", "user-roles-counts"] }
  )()

  return result
}