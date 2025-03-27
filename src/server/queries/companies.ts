"use server"

import "server-only"
import { type GetCompaniesSchema } from "~/lib/validations/companies"
import { auth } from "../auth";
import { and, count, eq, getTableColumns, ilike, or, type SQL } from "drizzle-orm";
import { companies, type Company, users } from "../db/schema";
import { getOrderBy, serializeWhere } from "../db/utils";
import { db } from "../db";
import { unstable_cache } from "~/lib/unstable-cache";
import { restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { type GetAllQueryParams } from "~/lib/types";
import { alias } from "drizzle-orm/pg-core";

export async function getCompanies(
  input: GetCompaniesSchema,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const usersUpdated = alias(users, 'users_updated');

      const offset = (input.page - 1) * input.perPage

      const whereConditions: (SQL | undefined)[] = [];

      if (input.id) {
        whereConditions.push(or(
          eq(companies.id, input.id),
        ));
      }
      if (input.name) {
        whereConditions.push(or(
          ilike(companies.id, `%${input.name}%`),
          ilike(companies.name, `%${input.name}%`),
          ilike(users.id, `%${input.name}%`),
          ilike(users.name, `%${input.name}%`),
          ilike(usersUpdated.id, `%${input.name}%`),
          ilike(usersUpdated.name, `%${input.name}%`),
        ));
      }

      const orderBy = getOrderBy({
        config: [
          { key: 'createUserName', column: users.name },
          { key: 'updateUserName', column: usersUpdated.name },
        ], 
        sortInput: input.sort, 
        defaultColumn: companies.name,
        table: companies
      });

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data: Company[] = await tx
          .select({
            ...getTableColumns(companies),
            createUserName: users.name,
            updateUserName: usersUpdated.name,
          })
          .from(companies)
          .limit(input.perPage)
          .offset(offset)
          .leftJoin(users, eq(companies.createUserId, users.id))
          .leftJoin(usersUpdated, eq(companies.updateUserId, usersUpdated.id))
          .where(and(...whereConditions))
          .orderBy(...orderBy)
  
        const total = await tx
          .select({ 
            count: count() 
          })
          .from(companies)
          .leftJoin(users, eq(companies.createUserId, users.id))
          .leftJoin(usersUpdated, eq(companies.updateUserId, usersUpdated.id))
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

export async function getAllCompaniesToMapItems(params?: GetAllQueryParams) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db.query.companiesToMapItems.findMany({
        where: params?.where,
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
    [`companies_to_map_items-${whereKey}`],
    { revalidate: false, tags: ["companies", "map_items"] }
  )()
  
  return result
}