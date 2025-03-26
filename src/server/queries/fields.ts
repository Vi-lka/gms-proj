"use server"

import "server-only"

import { type GetFieldsSchema } from "~/lib/validations/fields";
import { auth } from "../auth";
import { and, count, eq, getTableColumns, gt, ilike, inArray, or, type SQL } from "drizzle-orm";
import { companies, type Field, type FieldExtend, fields, users } from "../db/schema";
import { getOrderBy, serializeWhere } from "../db/utils";
import { db } from "../db";
import { unstable_cache } from "~/lib/unstable-cache";
import { restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { type GetAllQueryParams } from "~/lib/types";
import { alias } from "drizzle-orm/pg-core";

export async function getFields(
  input: GetFieldsSchema,
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
          eq(fields.id, input.id),
          eq(companies.id, input.id),
        ));
      }
      if (input.name) {
        whereConditions.push(or(
          ilike(fields.id, `%${input.name}%`),
          ilike(fields.name, `%${input.name}%`),
          ilike(companies.id, `%${input.name}%`),
          ilike(companies.name, `%${input.name}%`),
          ilike(users.id, `%${input.name}%`),
          ilike(users.name, `%${input.name}%`),
          ilike(usersUpdated.id, `%${input.name}%`),
          ilike(usersUpdated.name, `%${input.name}%`),
        ));
      }
      if (input.companyId) {
        whereConditions.push(eq(companies.id, input.companyId));
      }
      if (input.companyName) {
        const companiesInputs = input.companyName.split(',');
        whereConditions.push(or(
          ilike(companies.name, `%${input.companyName}%`),
          inArray(companies.id, companiesInputs),
          inArray(companies.name, companiesInputs)
        ));
      }
      
      const orderBy = getOrderBy({
        config: [
          { key: 'createUserName', column: users.name },
          { key: 'updateUserName', column: usersUpdated.name },
          { key: 'companyId', column: companies.id },
          { key: 'companyName', column: companies.name },
        ], 
        sortInput: input.sort, 
        defaultColumn: fields.name,
        table: fields
      });

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data: FieldExtend[] = await tx
          .select({
            ...getTableColumns(fields),
            companyName: companies.name,
            createUserName: users.name,
            updateUserName: usersUpdated.name,
          })
          .from(fields)
          .limit(input.perPage)
          .offset(offset)
          .leftJoin(users, eq(fields.createUserId, users.id))
          .leftJoin(usersUpdated, eq(fields.updateUserId, usersUpdated.id))
          .innerJoin(companies, eq(fields.companyId, companies.id))
          .where(and(...whereConditions))
          .orderBy(...orderBy)
  
        const total = await tx
          .select({ 
            count: count() 
          })
          .from(fields)
          .leftJoin(users, eq(fields.createUserId, users.id))
          .leftJoin(usersUpdated, eq(fields.updateUserId, usersUpdated.id))
          .innerJoin(companies, eq(fields.companyId, companies.id))
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
    { revalidate: false, tags: ["fields", "companies"] }
  )()

  return result
}

export async function getCompanyFieldsCounts(id?: string) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db
        .select({
          companyId: fields.companyId,
          count: count(),
        })
        .from(fields)
        .where(id ? eq(fields.id, id) : undefined)
        .groupBy(fields.companyId)
        .having(gt(count(), 0))
        .then((res) =>
          res.reduce(
            (acc, { companyId, count }) => {
              acc[companyId] = count
              return acc
            },
            {} as Record<Field["companyId"], number>
          )
        )
      return data
    } catch (err) {
      console.error(err)
      return {} as Record<Field["companyId"], number>
    }
  }

  const result = await unstable_cache(
    fetchData,
    ["company-fields-counts"],
    { revalidate: false, tags: ["fields"] }
  )()

  return result
}

export async function getAllFields(params?: GetAllQueryParams) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db.query.fields.findMany({
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
    [`fields-${whereKey}`],
    { revalidate: false, tags: ["fields"] }
  )()
  
  return result
}