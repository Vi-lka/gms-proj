import "server-only"

import { unstable_cache } from "~/lib/unstable-cache";
import { auth } from "../auth";
import { db } from "../db";

export async function getMap() {
  const session = await auth();
  if (session?.user.role !== "admin") {
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

      // const pageCount = Math.ceil(total / input.perPage)
      return { data }
    } catch (err) {
      console.error(err)
      return { data: undefined }
    }
  }

  const result = await unstable_cache(
    fetchData,
    ["map"],
    { revalidate: 3600, tags: ["map"] }
  )()

  return result
}

export async function getMapItems() {
  const session = await auth();
  if (session?.user.role !== "admin") {
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

      const { data, total } = await db.transaction(async (tx) => {
        const data = await tx
          .query.mapItems.findMany({
            with: {
              cluster: true,
              companies: true
            },
            // where: 
          })

        const total = await tx
          .query.mapItems.findMany({
            with: {
              cluster: true,
              companies: true
            },
            // where: 
          }).then(data => data.length)

        return {
          data,
          total,
        }
      })

      // const pageCount = Math.ceil(total / input.perPage)
      return { data, total }
    } catch (err) {
      console.error(err)
      return { data: [], total: 0 }
    }
  }

  const result = await unstable_cache(
    fetchData,
    // [JSON.stringify(input)],
    ["map_items"],
    { revalidate: 3600, tags: ["map_items"] }
  )()

  return result
}