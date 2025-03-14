"use server"

import "server-only"

import { type GetAreasDataSchema } from "~/lib/validations/areas-data";
import { auth } from "../auth";
import { unstable_cache } from "~/lib/unstable-cache";
import { and, count, ilike, inArray, or, eq } from "drizzle-orm";
import { areasData, companies, fields, licensedAreas } from "../db/schema";
import { db } from "../db";
import { getRelationOrderBy, orderData } from "../db/utils";
import { intervalToString, restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { filterColumns } from "~/lib/filter-columns";

export async function getAreasData(
  input: GetAreasDataSchema,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const offset = (input.page - 1) * input.perPage

      const advancedWhere = filterColumns({
        table: areasData,
        filters: input.filters,
        joinOperator: input.joinOperator,
      });

      const where = and(
        advancedWhere,
        and(
          input.areaName ? or(
            ilike(areasData.id, `%${input.areaName}%`),
            ilike(areasData.bush, `%${input.areaName}%`),
            ilike(areasData.hole, `%${input.areaName}%`),
            ilike(areasData.plast, `%${input.areaName}%`),
            ilike(areasData.horizon, `%${input.areaName}%`),
            ilike(areasData.retinue, `%${input.areaName}%`),
            ilike(areasData.protocol, `%${input.areaName}%`),
            ilike(areasData.sampleCode, `%${input.areaName}%`),
            ilike(areasData.analysisPlace, `%${input.areaName}%`),
            inArray(
              areasData.areaId,
              db
                .select({ id: licensedAreas.id })
                .from(licensedAreas)
                .where(
                  or(
                    ilike(licensedAreas.name, `%${input.areaName}%`),
                    ilike(licensedAreas.id, `%${input.areaName}%`),
                    inArray(
                      licensedAreas.fieldId,
                      db
                        .select({ id: fields.id })
                        .from(fields)
                        .where(
                          or(
                            ilike(fields.name, `%${input.areaName}%`),
                            ilike(fields.id, `%${input.areaName}%`),
                            inArray(
                              fields.companyId,
                              db
                                .select({ id: companies.id })
                                .from(companies)
                                .where(
                                  or(
                                    ilike(companies.name, `%${input.areaName}%`),
                                    ilike(companies.id, `%${input.areaName}%`),
                                  )
                                )
                            ),
                          )
                        )
                    ),
                  )
                )
            )
          ) : undefined,
          input.areaId ? (
            inArray(
              areasData.areaId,
              db
                .select({ id: licensedAreas.id })
                .from(licensedAreas)
                .where(eq(licensedAreas.id, input.areaId))
            )
          ) : undefined,
          input.fieldId ? (
            inArray(
              areasData.areaId,
              db
                .select({ id: licensedAreas.id })
                .from(licensedAreas)
                .where(
                  inArray(
                    licensedAreas.fieldId,
                    db
                      .select({ id: fields.id })
                      .from(fields)
                      .where(eq(fields.id, input.fieldId))
                  ),
                )
            )
          ) : undefined,
          (input.fieldsIds && input.fieldsIds.length > 0) ? (
            inArray(
              areasData.areaId,
              db
                .select({ id: licensedAreas.id })
                .from(licensedAreas)
                .where(
                  inArray(
                    licensedAreas.fieldId,
                    db
                      .select({ id: fields.id })
                      .from(fields)
                      .where(inArray(fields.id, input.fieldsIds))
                  ),
                )
            )
          ) : undefined,
          input.companyId ? (
            inArray(
              areasData.areaId,
              db
                .select({ id: licensedAreas.id })
                .from(licensedAreas)
                .where(
                  inArray(
                    licensedAreas.fieldId,
                    db
                      .select({ id: fields.id })
                      .from(fields)
                      .where(
                        inArray(
                          fields.companyId,
                          db
                            .select({ id: companies.id })
                            .from(companies)
                            .where(eq(companies.id, input.companyId),)
                        ),
                      )
                  ),
                )
            )
          ): undefined
        )
      )

      const { orderBy } = getRelationOrderBy(input.sort, areasData, areasData.id)

      const { data, total } = await db.transaction(async (tx) => {
        const data = await tx
          .query.areasData.findMany({
            limit: input.perPage,
            offset,
            where,
            orderBy,
            with: {
              area: {
                columns: {
                  id: true,
                  name: true
                },
                with: {
                  field: {
                    columns: {
                      id: true,
                      name: true
                    },
                    with: {
                      company: {
                        columns: {
                          id: true,
                          name: true
                        }
                      }
                    }
                  }
                }
              }
            }
          })

          const total = await tx
            .select({
              count: count(),
            })
            .from(areasData)
            .where(where)
            .execute()
            .then((res) => res[0]?.count ?? 0)


        return {
          data,
          total,
        }
      })

      const transformData = data.map(({area, ...other}) => ({
        ...other,
        areaName: area.name,
        fieldId: area.field.id,
        fieldName: area.field.name,
        companyId: area.field.company.id,
        companyName: area.field.company.name,
        occurrenceInterval: intervalToString(
          other.occurrenceIntervalStart,
          other.occurrenceIntervalEnd
        )
      }))

      const sortedData = orderData(input.sort, transformData)

      const pageCount = Math.ceil(total / input.perPage)
      
      return { data: sortedData, pageCount, error: null }
    } catch (err) {
      console.error(err)
      return { data: [], pageCount: 0, error: getErrorMessage(err) }
    }
  }

  // await new Promise((resolve) => setTimeout(resolve, 2000))

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: 60, tags: ["fields", "map_items"] }
  )()

  return result
}