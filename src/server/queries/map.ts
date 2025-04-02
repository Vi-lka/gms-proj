"use server"

import "server-only"

import { unstable_cache } from "~/lib/unstable-cache";
import { auth } from "../auth";
import { db } from "../db";
import { restrictUser } from "~/lib/utils";
import { type GetMapItemsSchema } from "~/lib/validations/map-items";
import { and, ilike, inArray, or } from "drizzle-orm";
import { areasData, clusters, companies, companiesToMapItems, fields, licensedAreas, mapItems } from "../db/schema";
import { compareElements } from "../db/utils";
import { getErrorMessage } from "~/lib/handle-error";
import * as Sentry from "@sentry/nextjs";

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
              mapItems.clusterId,
              db
                .select({ id: clusters.id })
                .from(clusters)
                .where(ilike(clusters.name, `%${input.search}%`))
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
          (input?.companiesIds && input.companiesIds.length > 0) ? (
            inArray(
              mapItems.id,
              db
                .select({ mapItemId: companiesToMapItems.mapItemId })
                .from(companiesToMapItems)
                .where(
                  inArray(
                    companiesToMapItems.companyId,
                    input.companiesIds
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

      return { data, error: null }
    } catch (err) {
      Sentry.captureException(err);
      console.error(err)
      return { data: [], error: getErrorMessage(err) }
    }
  }

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: 3600, tags: ["map_items", "clusters", "companies", "fields", "licensed_areas", "areas_data"] }
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
            fields: {
              with: {
                company: true,
                fieldMap: true
              },
            },
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

      if (!data) return { data: null, error: "Not Found" }

      return { data, error: null }
    } catch (err) {
      Sentry.captureException(err);
      console.error(err)
      return { data: null, error: getErrorMessage(err) }
    }
  }

  const result = await unstable_cache(
    fetchData,
    [id],
    { revalidate: false, tags: ["map_items", "clusters", "companies", "fields", "fields_maps"] }
  )()

  return result
}