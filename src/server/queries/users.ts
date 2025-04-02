"use server"

import "server-only"

import { unstable_cache } from "~/lib/unstable-cache";
import { type GetSessionsSchema, type GetUsersSchema } from "~/lib/validations/users";
import { type SessionExtend, sessions, type User, users } from "../db/schema";
import {
  gt,
  count,
  and,
  ilike,
  inArray,
  or,
  eq,
  type SQL,
  getTableColumns,
} from "drizzle-orm"
import { db } from "../db";
import { auth } from "../auth";
import { getOrderBy, getRelationOrderBy } from "../db/utils";
import { restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import * as Sentry from "@sentry/nextjs";

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
            ilike(users.id, `%${input.name}%`),
            ilike(users.name, `%${input.name}%`),
            ilike(users.email, `%${input.name}%`)
          ) : undefined,
          input.role.length > 0
            ? inArray(users.role, input.role)
            : undefined,
        )

      const { orderBy } = getRelationOrderBy(input.sort, users, users.id)

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
      return { data, pageCount, error: null }
    } catch (err) {
      Sentry.captureException(err);
      console.error(err)
      return { data: [], pageCount: 0, error: getErrorMessage(err) }
    }
  }

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: false, tags: ["users"] }
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
      Sentry.captureException(err);
      console.error(err)
      return {} as Record<User["role"], number>
    }
  }

  const result = await unstable_cache(
    fetchData,
    ["user-roles-counts"],
    { revalidate: false, tags: ["users", "user-roles-counts"] }
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

      const whereConditions: (SQL | undefined)[] = [
        gt(sessions.expires, currentDate)
      ];

      if (input.userId) {
        whereConditions.push(ilike(sessions.userId, `%${input.userId}%`))
      }
      if (input.name) {
        whereConditions.push(or(
          ilike(sessions.userId, `%${input.name}%`),
          ilike(users.name, `%${input.name}%`),
          ilike(users.email, `%${input.name}%`),
        ));
      }
      if (input.role.length > 0) {
        whereConditions.push(inArray(users.role, input.role))
      }

      const orderBy = getOrderBy({
        config: [
          { key: 'name', column: users.name },
          { key: 'email', column: users.email },
          { key: 'role', column: users.role },
        ], 
        sortInput: input.sort, 
        defaultColumn: users.name,
        table: sessions
      });

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data: SessionExtend[] = await tx
          .select({
            ...getTableColumns(sessions),
            name: users.name,
            email: users.email,
            role: users.role,
          })
          .from(sessions)
          .limit(input.perPage)
          .offset(offset)
          .innerJoin(users, eq(sessions.userId, users.id))
          .where(and(...whereConditions))
          .orderBy(...orderBy)
  
        const total = await tx
          .select({ 
            count: count() 
          })
          .from(sessions)
          .innerJoin(users, eq(sessions.userId, users.id))
          .where(and(...whereConditions))
          .execute()
          .then((res) => res[0]?.count ?? 0)
    
        const pageCount = Math.ceil(total / input.perPage);

        return {
          data,
          pageCount,
        }
      })

      return { data, pageCount, error: null }
    } catch (err) {
      Sentry.captureException(err);
      console.error(err)
      return { data: [], pageCount: 0, error: getErrorMessage(err) }
    }
  }

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input), currentDate.toLocaleDateString()],
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
      Sentry.captureException(err);
      console.error(err)
      return {} as Record<User["role"], number>
    }
  }

  const result = await unstable_cache(
    fetchData,
    ["user-roles-counts", currentDate.toLocaleDateString()],
    { revalidate: 60, tags: ["users", "user-roles-counts"] }
  )()

  return result
}