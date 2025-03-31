"use server"

import "server-only"

import { type GetAreasDataSchema } from "~/lib/validations/areas-data";
import { auth } from "../auth";
import { unstable_cache } from "~/lib/unstable-cache";
import { and, ilike, inArray, or, gt, eq, count, type SQL, getTableColumns } from "drizzle-orm";
import { type AreaData, type AreaDataExtend, areasData, companies, type Field, fields, type LicensedArea, licensedAreas, users } from "../db/schema";
import { db } from "../db";
import { getOrderBy, serializeWhere } from "../db/utils";
import { intervalToString, restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { filterColumns } from "~/lib/filter-columns";
import { type GetAllQueryParams } from "~/lib/types";
import { alias } from "drizzle-orm/pg-core";

export async function getAreasData(
  input: GetAreasDataSchema
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
      const whereSearchConditions: (SQL | undefined)[] = [];

      if (input.search) {
        whereSearchConditions.push(or(
          ilike(areasData.id, `%${input.search}%`),
          ilike(areasData.bush, `%${input.search}%`),
          ilike(areasData.hole, `%${input.search}%`),
          ilike(areasData.plast, `%${input.search}%`),
          ilike(areasData.horizon, `%${input.search}%`),
          ilike(areasData.retinue, `%${input.search}%`),
          ilike(areasData.protocol, `%${input.search}%`),
          ilike(areasData.sampleCode, `%${input.search}%`),
          ilike(areasData.analysisPlace, `%${input.search}%`),
          ilike(licensedAreas.id, `%${input.search}%`),
          ilike(licensedAreas.name, `%${input.search}%`),
          ilike(fields.id, `%${input.search}%`),
          ilike(fields.name, `%${input.search}%`),
          ilike(companies.id, `%${input.search}%`),
          ilike(companies.name, `%${input.search}%`),
          ilike(users.id, `%${input.search}%`),
          ilike(users.name, `%${input.search}%`),
          ilike(usersUpdated.id, `%${input.search}%`),
          ilike(usersUpdated.name, `%${input.search}%`),
        ));
      }
      if (input.areaId) {
        whereConditions.push(eq(licensedAreas.id, input.areaId));
      }
      if (input.areaName) {
        const areasInputs = input.areaName.split(',');
        whereConditions.push(or(
          ilike(licensedAreas.name, `%${input.areaName}%`),
          inArray(licensedAreas.id, areasInputs),
          inArray(licensedAreas.name, areasInputs)
        ));
      }
      if (input.fieldId) {
        whereConditions.push(eq(fields.id, input.fieldId));
      }
      if (input.fieldName) {
        const fieldsInputs = input.fieldName.split(',');
        whereConditions.push(or(
          ilike(fields.name, `%${input.fieldName}%`),
          inArray(fields.id, fieldsInputs),
          inArray(fields.name, fieldsInputs)
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
      if (input.fieldsIds && input.fieldsIds.length > 0) {
        whereConditions.push(inArray(fields.id, input.fieldsIds));
      }

      const advancedWhere = filterColumns({
        table: areasData,
        filters: input.filters,
        joinOperator: input.joinOperator,
      });

      const where = and(
        advancedWhere,
        and(
          ...whereConditions,
          ...whereSearchConditions,
        )
      )

      const orderBy = getOrderBy({
        config: [
          { key: 'occurrenceInterval', column: areasData.occurrenceIntervalStart },
          { key: 'createUserName', column: users.name },
          { key: 'updateUserName', column: usersUpdated.name },
          { key: 'areaName', column: licensedAreas.name },
          { key: 'fieldId', column: fields.id },
          { key: 'fieldName', column: fields.name },
          { key: 'companyId', column: companies.id },
          { key: 'companyName', column: companies.name },
        ], 
        sortInput: input.sort, 
        defaultColumn: companies.name,
        table: areasData
      });

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data = await tx
          .select({
            ...getTableColumns(areasData),
            areaName: licensedAreas.name,
            fieldId: fields.id,
            fieldName: fields.name,
            companyId: companies.id,
            companyName: companies.name,
            createUserName: users.name,
            updateUserName: usersUpdated.name,
          })
          .from(areasData)
          .limit(input.perPage)
          .offset(offset)
          .leftJoin(users, eq(areasData.createUserId, users.id))
          .leftJoin(usersUpdated, eq(areasData.updateUserId, usersUpdated.id))
          .innerJoin(licensedAreas, eq(areasData.areaId, licensedAreas.id))
          .innerJoin(fields, eq(licensedAreas.fieldId, fields.id))
          .innerJoin(companies, eq(fields.companyId, companies.id))
          .where(where)
          .orderBy(...orderBy)


        const transformData: AreaDataExtend[] = data.map((item) => ({
          ...item,
          occurrenceInterval: intervalToString(
            item.occurrenceIntervalStart,
            item.occurrenceIntervalEnd
          )
        }))
  
        const total = await tx
          .select({ 
            count: count() 
          })
          .from(areasData)
          .leftJoin(users, eq(areasData.createUserId, users.id))
          .leftJoin(usersUpdated, eq(areasData.updateUserId, usersUpdated.id))
          .innerJoin(licensedAreas, eq(areasData.areaId, licensedAreas.id))
          .innerJoin(fields, eq(licensedAreas.fieldId, fields.id))
          .innerJoin(companies, eq(fields.companyId, companies.id))
          .where(where)
          .execute()
          .then((res) => res[0]?.count ?? 0)
    
        const pageCount = Math.ceil(total / input.perPage);

        return {
          data: transformData,
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