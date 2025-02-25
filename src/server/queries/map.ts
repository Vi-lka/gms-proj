"use server"

import "server-only"

import { unstable_cache } from "~/lib/unstable-cache";
import { auth } from "../auth";
import { db } from "../db";
import { restrictUser } from "~/lib/utils";

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
    { revalidate: 60, tags: ["map"] }
  )()

  return result
}

export async function getMapItems() {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const { data, total } = await db.transaction(async (tx) => {
        const data = await tx
          .query.mapItems.findMany({
            with: {
              cluster: true,
              fields: true,
              companiesToMapItems: {
                with: {
                  company: true
                },
              },
            },
          })

        const total = await tx
          .query.mapItems.findMany({
            with: {
              cluster: true,
              fields: true,
              companiesToMapItems: true,
            },
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
    { revalidate: 60, tags: ["map_items"] }
  )()

  return result
}

export async function getMapItem(id: string) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db
        .query.mapItems.findFirst({
          with: {
            cluster: true,
            companiesToMapItems: {
              with: {
                company: true
              }
            }
          },
          where(fields, operators) {
            return operators.eq(fields.id, id)
          },
        })

      return data
    } catch (err) {
      console.error(err)
    }
  }

  const result = await unstable_cache(
    fetchData,
    [id],
    { revalidate: 60, tags: ["map_items"] }
  )()

  return result
}