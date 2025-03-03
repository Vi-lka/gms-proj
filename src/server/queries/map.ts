"use server"

import "server-only"

import { unstable_cache } from "~/lib/unstable-cache";
import { auth } from "../auth";
import { db } from "../db";
import { restrictUser } from "~/lib/utils";
import { type GetMapItemsSchema } from "~/lib/validations/map-items";
import { and, ilike, inArray, or } from "drizzle-orm";
import { areasData, companies, companiesToMapItems, fields, licensedAreas, mapItems } from "../db/schema";
import { compareElements } from "../db/utils";

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

export async function getMapItems(
  input?: GetMapItemsSchema,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {

      const compareElementsConditions = input?.elements ? compareElements(areasData, input.elements) : []

      const where = and(
          input?.search ? or(
            inArray(
              mapItems.id,
              db
                .select({ mapItemId: companiesToMapItems.mapItemId })
                .from(companiesToMapItems)
                .where(
                  inArray(
                    companiesToMapItems.companyId,
                    db
                      .select({ id: companies.id })
                      .from(companies)
                      .where(ilike(companies.name, `%${input.search}%`))
                  ),
                )
            ),
            inArray(
              mapItems.id,
              db
                .select({mapItemId: fields.mapItemId})
                .from(fields)
                .where(
                  or(
                    ilike(fields.name, `%${input.search}%`),
                    inArray(
                      fields.id,
                      db
                        .select({ fieldId: licensedAreas.fieldId })
                        .from(licensedAreas)
                        .where(
                          or(
                            ilike(licensedAreas.name, `%${input.search}%`),
                            inArray(
                              licensedAreas.id,
                              db
                                .select({ areaId: areasData.areaId })
                                .from(areasData)
                                .where(
                                  or(
                                    ilike(areasData.bush, `%${input.search}%`),
                                    ilike(areasData.hole, `%${input.search}%`),
                                    ilike(areasData.plast, `%${input.search}%`),
                                    ilike(areasData.horizon, `%${input.search}%`),
                                    ilike(areasData.retinue, `%${input.search}%`),
                                    ilike(areasData.protocol, `%${input.search}%`),
                                    ilike(areasData.sampleCode, `%${input.search}%`),
                                    ilike(areasData.analysisPlace, `%${input.search}%`),
                                    ilike(areasData.note, `%${input.search}%`),
                                  )
                                )
                            )
                          )
                        )
                    )
                  )
                )
            )
          ) : undefined,
          (input?.comapniesIds && input.comapniesIds.length > 0) ? (
            inArray(
              mapItems.id,
              db
                .select({ mapItemId: companiesToMapItems.mapItemId })
                .from(companiesToMapItems)
                .where(
                  inArray(
                    companiesToMapItems.companyId,
                    input.comapniesIds
                  ),
                )
            )
          ) : undefined,
          (input?.elements && compareElementsConditions.length > 0) ? (
            inArray(
              mapItems.id,
              db
                .select({mapItemId: fields.mapItemId})
                .from(fields)
                .where(
                  inArray(
                    fields.id,
                    db
                      .select({ fieldId: licensedAreas.fieldId })
                      .from(licensedAreas)
                      .where(
                        inArray(
                          licensedAreas.id,
                          db
                            .select({ areaId: areasData.areaId })
                            .from(areasData)
                            .where(and(...compareElementsConditions))
                        )
                      )
                  )
                )
            )
          ) : undefined
        )

      const data = await db.transaction(async (tx) => {
        const data = await tx
          .query.mapItems.findMany({
            with: {
              cluster: true,
              fields: {
                with: {
                  licensedAreas: true,
                }
              },
              companiesToMapItems: {
                with: {
                  company: true
                },
              },
            },
            where
          })

        const licensedAreasIds: string[] = []

        data.forEach(item => {
          item.fields.forEach(field => {
            field.licensedAreas.forEach(licensedArea => {
              licensedAreasIds.push(licensedArea.id)
            })
          })
        })

        const areasData = await tx
          .query.areasData.findMany({
            where(fields, operators) {
              return operators.inArray(
                fields.areaId, 
                licensedAreasIds
              )
            },
        })

        const validData = data.map(item => {
          const licensedAreasIds: string[] = []

          item.fields.forEach(field => {
            field.licensedAreas.forEach(licensedArea => {
              licensedAreasIds.push(licensedArea.id)
            })
          })

          return {
            ...item,
            areasData: areasData.filter(areaData => {
              return licensedAreasIds.includes(areaData.areaId)
            })
          }
        })

        return validData
      })

      return data
    } catch (err) {
      console.error(err)
      return []
    }
  }

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: 3600, tags: ["map_items"] }
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