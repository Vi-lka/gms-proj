"use server"

import "server-only"

import { type GetAreasDataSchema } from "~/lib/validations/areas-data";
import { auth } from "../auth";
import { unstable_cache } from "~/lib/unstable-cache";
import { and, ilike, inArray, or, gt, eq, count } from "drizzle-orm";
import { type AreaData, areasData, companies, type Field, fields, type LicensedArea, licensedAreas, users } from "../db/schema";
import { db } from "../db";
import { getRelationOrderBy, orderData, paginate, serializeWhere } from "../db/utils";
import { intervalToString, restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { filterColumns } from "~/lib/filter-columns";
import { type GetAllQueryParams } from "~/lib/types";

export async function getAreasData(
  input: GetAreasDataSchema,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      // const offset = (input.page - 1) * input.perPage
      const companiesInputs = input.companyName.split(',');
      const fieldsInputs = input.fieldName.split(',');
      const areasInputs = input.areaName.split(',');

      const advancedWhere = filterColumns({
        table: areasData,
        filters: input.filters,
        joinOperator: input.joinOperator,
      });

      const where = and(
        advancedWhere,
        and(
          // TODO: refactor this >>
          or (
            input.id ? or(
              ilike(areasData.id, `%${input.id}%`),
              ilike(areasData.bush, `%${input.id}%`),
              ilike(areasData.hole, `%${input.id}%`),
              ilike(areasData.plast, `%${input.id}%`),
              ilike(areasData.horizon, `%${input.id}%`),
              ilike(areasData.retinue, `%${input.id}%`),
              ilike(areasData.protocol, `%${input.id}%`),
              ilike(areasData.sampleCode, `%${input.id}%`),
              ilike(areasData.analysisPlace, `%${input.id}%`),
              inArray(
                areasData.createUserId,
                db
                  .select({ id: users.id })
                  .from(users)
                  .where(
                    or(
                      ilike(users.name, `%${input.id}%`),
                      ilike(users.id, `%${input.id}%`),
                    )
                  )
              ),
              inArray(
                areasData.updateUserId,
                db
                  .select({ id: users.id })
                  .from(users)
                  .where(
                    or(
                      ilike(users.name, `%${input.id}%`),
                      ilike(users.id, `%${input.id}%`),
                    )
                  )
              ),
              inArray(
                areasData.areaId,
                db
                  .select({ id: licensedAreas.id })
                  .from(licensedAreas)
                  .where(
                    or(
                      ilike(licensedAreas.name, `%${input.id}%`),
                      ilike(licensedAreas.id, `%${input.id}%`),
                      inArray(licensedAreas.id, areasInputs),
                      inArray(licensedAreas.name, areasInputs),
                      inArray(
                        licensedAreas.fieldId,
                        db
                          .select({ id: fields.id })
                          .from(fields)
                          .where(
                            or(
                              ilike(fields.name, `%${input.id}%`),
                              ilike(fields.id, `%${input.id}%`),
                              inArray(
                                fields.companyId,
                                db
                                  .select({ id: companies.id })
                                  .from(companies)
                                  .where(
                                    or(
                                      ilike(companies.name, `%${input.id}%`),
                                      ilike(companies.id, `%${input.id}%`),
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
                areasData.createUserId,
                db
                  .select({ id: users.id })
                  .from(users)
                  .where(
                    or(
                      ilike(users.name, `%${input.areaName}%`),
                      ilike(users.id, `%${input.areaName}%`),
                    )
                  )
              ),
              inArray(
                areasData.updateUserId,
                db
                  .select({ id: users.id })
                  .from(users)
                  .where(
                    or(
                      ilike(users.name, `%${input.areaName}%`),
                      ilike(users.id, `%${input.areaName}%`),
                    )
                  )
              ),
              inArray(
                areasData.areaId,
                db
                  .select({ id: licensedAreas.id })
                  .from(licensedAreas)
                  .where(
                    or(
                      ilike(licensedAreas.name, `%${input.areaName}%`),
                      ilike(licensedAreas.id, `%${input.areaName}%`),
                      inArray(licensedAreas.id, areasInputs),
                      inArray(licensedAreas.name, areasInputs),
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
          ),
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
          input.fieldName ? (
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
                      .where(or(
                        ilike(fields.name, `%${input.fieldName}%`),
                        inArray(fields.id, fieldsInputs),
                        inArray(fields.name, fieldsInputs)
                      ))
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
          ) : undefined,
          input.companyName ? (
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
                            .where(or(
                              ilike(companies.name, `%${input.companyName}%`),
                              inArray(companies.id, companiesInputs),
                              inArray(companies.name, companiesInputs)
                            ))
                        ),
                      )
                  ),
                )
            )
          ) : undefined,
        )
      )

      const { orderBy } = getRelationOrderBy(input.sort, areasData, areasData.id)

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data = await tx
          .query.areasData.findMany({
            // limit: input.perPage,
            // offset,
            where,
            orderBy,
            with: {
              userCreated: {
                columns: { name: true }
              },
              userUpdated: {
                columns: { name: true }
              },
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

          // const total = await tx
          //   .select({
          //     count: count(),
          //   })
          //   .from(areasData)
          //   .where(where)
          //   .execute()
          //   .then((res) => res[0]?.count ?? 0)

        const transformData = data.map(({area, userCreated, userUpdated, ...other}) => ({
          ...other,
          createUserName: userCreated ? userCreated.name : null,
          updateUserName: userUpdated ? userUpdated.name : null,
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

        const paginated = paginate(sortedData, input)

        return {
          data: paginated.items,
          pageCount: paginated.totalPages,
        }
      })

      return { data, pageCount, error: null }
    } catch (err) {
      console.error(err)
      return { data: [], pageCount: 0, error: getErrorMessage(err) }
    }
  }

  // await new Promise((resolve) => setTimeout(resolve, 2000))

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: false, tags: ["areas_data", "companies", "fields", "licensed_areas"] }
  )()

  return result
}

export async function getLicensedAreaDataCounts() {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db
        .select({
          areaId: areasData.areaId,
          count: count(),
        })
        .from(areasData)
        .groupBy(areasData.areaId)
        .having(gt(count(), 0))
        .then((res) =>
          res.reduce(
            (acc, { areaId, count }) => {
              acc[areaId] = count
              return acc
            },
            {} as Record<AreaData["areaId"], number>
          )
        )
      return data
    } catch (err) {
      console.error(err)
      return {} as Record<AreaData["areaId"], number>
    }
  }

  const result = await unstable_cache(
    fetchData,
    ["licensed-area-data-counts"],
    { revalidate: false, tags: ["areas_data"] }
  )()

  return result
}

export async function getFieldAreasDataCounts() {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db
        .select({
          fieldId: licensedAreas.fieldId,
          count: count(),
        })
        .from(areasData)
        .leftJoin(licensedAreas, eq(areasData.areaId, licensedAreas.id))
        .groupBy(licensedAreas.fieldId)
        .having(gt(count(), 0))
        .then((res) =>
          res.reduce(
            (acc, { fieldId, count }) => {
              if (fieldId !== null) {
                acc[fieldId] = count;
              }
              return acc;
            },
            {} as Record<LicensedArea["fieldId"], number>
          )
        );
      return data;
    } catch (err) {
      console.error(err);
      return {} as Record<LicensedArea["fieldId"], number>;
    }
  };

  const result = await unstable_cache(
    fetchData,
    ["field-areas-data-counts"],
    { revalidate: false, tags: ["areas_data", "licensed_areas"] }
  )();

  return result;
}

export async function getCompanyAreasDataCounts() {
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
        .from(areasData)
        .leftJoin(licensedAreas, eq(areasData.areaId, licensedAreas.id))
        .leftJoin(fields, eq(licensedAreas.fieldId, fields.id))
        .groupBy(fields.companyId)
        .having(gt(count(), 0))
        .then((res) =>
          res.reduce(
            (acc, { companyId, count }) => {
              if (companyId !== null) {
                acc[companyId] = count;
              }
              return acc;
            },
            {} as Record<Field["companyId"], number>
          )
        );
      return data;
    } catch (err) {
      console.error(err);
      return {} as Record<Field["companyId"], number>;
    }
  };

  const result = await unstable_cache(
    fetchData,
    ["company-areas-data-counts"],
    { revalidate: false, tags: ["areas_data", "licensed_areas", "fields"] }
  )();

  return result;
}

export async function getAllAreasData(params?: GetAllQueryParams) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const data = await db.query.areasData.findMany({
        where: params?.where,
        orderBy(fields, operators) {
          return operators.asc(fields.areaId)
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
    [`areas_data-${whereKey}`],
    { revalidate: false, tags: ["areas_data"] }
  )()
  
  return result
}