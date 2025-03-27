"use server"

import "server-only"

import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { db } from "../db";
import { getErrorMessage } from "~/lib/handle-error";
import { unstable_cache } from "~/lib/unstable-cache";
import { getPresignedUrl } from "../s3-bucket/queries";
import { mapData, users, type MapDataExtend } from "../db/schema";
import { type GetMapsSchema } from "~/lib/validations/map-svg";
import { alias } from "drizzle-orm/pg-core";
import { eq, and, type SQL, count, getTableColumns } from "drizzle-orm";
import { getRelationOrderBy } from "../db/utils";

export async function getMaps(
  input: GetMapsSchema,
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
        whereConditions.push(eq(mapData.id, input.id));
      }
      if (input.selected !== null) {
        whereConditions.push(eq(mapData.selected, input.selected));
      }

      const { orderBy } = getRelationOrderBy(input.sort, mapData, mapData.selected)

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data = await tx
          .select({
            ...getTableColumns(mapData),
            createUserName: users.name,
            updateUserName: usersUpdated.name,
          })
          .from(mapData)
          .limit(input.perPage)
          .offset(offset)
          .leftJoin(users, eq(mapData.createUserId, users.id))
          .leftJoin(usersUpdated, eq(mapData.updateUserId, usersUpdated.id))
          .where(and(...whereConditions))
          .orderBy(...orderBy)
  
        const total = await tx
          .select({ 
            count: count() 
          })
          .from(mapData)
          .leftJoin(users, eq(mapData.createUserId, users.id))
          .leftJoin(usersUpdated, eq(mapData.updateUserId, usersUpdated.id))
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
    { revalidate: false, tags: ["map-data", "files"] }
  )()

  const dataWithUrls: MapDataExtend[] = await Promise.all(
    result.data.map(async (map) => {
      const fileUrl = await getPresignedUrl(map.fileId)
      if (fileUrl.error !== null) throw new Error(fileUrl.error)
      return {
        ...map,
        svgUrl: fileUrl.data,
      }
    })
  )

  return {
    data: dataWithUrls,
    pageCount: result.pageCount,
    error: result.error
  }
}

export async function getMap() {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      // const offset = (input.page - 1) * input.perPage

      // const where = and(
          // input.name ? or(
            // ilike(users.name, `%${input.name}%`),
            // ilike(users.id, `%${input.name}%`)
          // ) : undefined,
          // input.role.length > 0
            // ? inArray(users.role, input.role)
            // : undefined,
        // )

      const data = await db.query.mapData.findFirst({
        where: (data, { eq }) => eq(data.selected, true),
      })

      if (!data) return { data: null, error: "Not Found" }

      // const pageCount = Math.ceil(total / input.perPage)
      return { data, error: null }
    } catch (err) {
      console.error(err)
      return { data: null, error: getErrorMessage(err) }
    }
  }

  const result = await unstable_cache(
    fetchData,
    ["map-data"],
    { revalidate: false, tags: ["map-data", "files"] }
  )()

  if (result.error !== null) {
    if (result.error === "Not Found") return {
      data: null, 
      error: null
}
    return {
      data: null,
      error: result.error
    }
  }

  const fileUrl = await getPresignedUrl(result.data.fileId)

  if (fileUrl.error !== null) return {
    data: null,
    error: fileUrl.error
  }

  const validData: MapDataExtend = {
    ...result.data,
    svgUrl: fileUrl.data,
  }

  return {
    data: validData,
    error: null
  }
}