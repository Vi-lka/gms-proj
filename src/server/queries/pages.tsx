"use server"

import "server-only"
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { getErrorMessage } from "~/lib/handle-error";
import { getFieldMapWithImage } from "./fields-maps";
import { getMapItem } from "./map";
import { getAreasData } from "./area-data";
import { type GetAreasDataSchema } from "~/lib/validations/areas-data";
import { db } from "../db";
import { count, eq, inArray } from "drizzle-orm";
import { areasData, fields, fieldsMaps, files, licensedAreas, mapItems, users } from "../db/schema";
import { unstable_cache } from "~/lib/unstable-cache";
import { type RecentItem } from "~/lib/types";
import { type GetRecentSchema } from "~/lib/validations/pages";
import { orderData, paginate } from "../db/utils";

// Counts of entities
export async function getCounts() {
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel')) {
    throw new Error("No access");
  }
  
  const fetchData = async () => {
    try {
      const data = await db.transaction(async (tx) => {
        const usersCount = await tx
          .select({
            count: count(),
          })
          .from(users)
          .execute()
          .then((res) => res[0]?.count ?? 0)

        const companiesCount = await tx
          .select({
            count: count(),
          })
          .from(licensedAreas)
          .execute()
          .then((res) => res[0]?.count ?? 0)

        const fieldsCount = await tx
          .select({
            count: count(),
          })
          .from(fields)
          .execute()
          .then((res) => res[0]?.count ?? 0)
        
        const licensedAreasCount = await tx
          .select({
            count: count(),
          })
          .from(licensedAreas)
          .execute()
          .then((res) => res[0]?.count ?? 0)

        const mapItemsCount = await tx
          .select({
            count: count(),
          })
          .from(mapItems)
          .execute()
          .then((res) => res[0]?.count ?? 0)

        const fieldsMapsCount = await tx
          .select({
            count: count(),
          })
          .from(fieldsMaps)
          .execute()
          .then((res) => res[0]?.count ?? 0)

        const areasDataCount = await tx
          .select({
            count: count(),
          })
          .from(areasData)
          .execute()
          .then((res) => res[0]?.count ?? 0)

        const filesCount = await tx
          .select({
            count: count(),
          })
          .from(files)
          .execute()
          .then((res) => res[0]?.count ?? 0)
        
        return {
          usersCount,
          companiesCount,
          fieldsCount,
          licensedAreasCount,
          mapItemsCount,
          fieldsMapsCount,
          areasDataCount,
          filesCount,
        }
      })

      return { 
        data,
        error: null
      }
    } catch (error) {
      console.error(error)
      return { data: null, error: getErrorMessage(error) }
    }
  }

  const result = await unstable_cache(
    fetchData,
    ["counts"],
    { revalidate: false, tags: ["map_items", "companies", "fields", "licensed_areas", "areas_data", "fields_maps", "files", "users"] }
  )()

  return result
}

// Recent changes
export async function getRecent(currentDate: string, input: GetRecentSchema) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const today = new Date(currentDate)
      const priorDate = new Date(new Date().setDate(today.getDate() - 30));

      const data: RecentItem[] = await db.transaction(async (tx) => {
        const mapItems = await tx
          .query.mapItems.findMany({
            with: {
              userCreated: true,
              userUpdated: true,
              cluster: true,
              companiesToMapItems: {
                with: { company: true },
              },
            },
            where(fields, operators) {
              return operators.or(
                operators.gt(fields.updatedAt, priorDate),
                operators.gt(fields.createdAt, priorDate)
              )
            },
          }).then(res => res.map(
            item => ({
              id: item.id,
              title: item.cluster?.name ?? item.companiesToMapItems[0]?.company.name,
              type: "mapItem" as const,
              createUserName: item.userCreated ? item.userCreated.name : null,
              updateUserName: item.userUpdated ? item.userUpdated.name : null,
              createUserId: item.createUserId,
              updateUserId: item.updateUserId,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            })
          ))

        const clusters = await tx
          .query.clusters.findMany({
            with: {
              userCreated: true,
              userUpdated: true,
              mapItem: true,
            },
            where(fields, operators) {
              return operators.or(
                operators.gt(fields.updatedAt, priorDate),
                operators.gt(fields.createdAt, priorDate)
              )
            },
          }).then(res => res.map(
            item => ({
              id: item.mapItem?.id ?? item.id,
              title: item.name,
              type: "cluster" as const,
              createUserName: item.userCreated ? item.userCreated.name : null,
              updateUserName: item.userUpdated ? item.userUpdated.name : null,
              createUserId: item.createUserId,
              updateUserId: item.updateUserId,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            })
          ))

        const companies = await tx
          .query.companies.findMany({
            with: {
              userCreated: true,
              userUpdated: true,
            },
            where(fields, operators) {
              return operators.or(
                operators.gt(fields.updatedAt, priorDate),
                operators.gt(fields.createdAt, priorDate)
              )
            },
          }).then(res => res.map(
            item => ({
              id: item.id,
              title: item.name,
              type: "company" as const,
              createUserName: item.userCreated ? item.userCreated.name : null,
              updateUserName: item.userUpdated ? item.userUpdated.name : null,
              createUserId: item.createUserId,
              updateUserId: item.updateUserId,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            })
          ))

        const fields = await tx
          .query.fields.findMany({
            with: {
              userCreated: true,
              userUpdated: true,
            },
            where(fields, operators) {
              return operators.or(
                operators.gt(fields.updatedAt, priorDate),
                operators.gt(fields.createdAt, priorDate)
              )
            },
          }).then(res => res.map(
            item => ({
              id: item.id,
              title: item.name,
              type: "field" as const,
              createUserName: item.userCreated ? item.userCreated.name : null,
              updateUserName: item.userUpdated ? item.userUpdated.name : null,
              createUserId: item.createUserId,
              updateUserId: item.updateUserId,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            })
          ))

        const licensedAreas = await tx
          .query.licensedAreas.findMany({
            with: {
              userCreated: true,
              userUpdated: true,
            },
            where(fields, operators) {
              return operators.or(
                operators.gt(fields.updatedAt, priorDate),
                operators.gt(fields.createdAt, priorDate)
              )
            },
          }).then(res => res.map(
            item => ({
              id: item.id,
              title: item.name,
              type: "licensedArea" as const,
              createUserName: item.userCreated ? item.userCreated.name : null,
              updateUserName: item.userUpdated ? item.userUpdated.name : null,
              createUserId: item.createUserId,
              updateUserId: item.updateUserId,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            })
          ))

        const areasData = await tx
          .query.areasData.findMany({
            with: { 
              userCreated: true,
              userUpdated: true,
              area: true 
            },
            where(fields, operators) {
              return operators.or(
                operators.gt(fields.updatedAt, priorDate),
                operators.gt(fields.createdAt, priorDate)
              )
            },
          }).then(res => res.map(
            item => ({
              id: item.id,
              title: item.area.name,
              type: "areaData" as const,
              createUserName: item.userCreated ? item.userCreated.name : null,
              updateUserName: item.userUpdated ? item.userUpdated.name : null,
              createUserId: item.createUserId,
              updateUserId: item.updateUserId,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            })
          ))

        const fieldsMaps = await tx
          .query.fieldsMaps.findMany({
            with: {
              userCreated: true,
              userUpdated: true,
              field: {
                columns: { name: true }
              }
            },
            where(fields, operators) {
              return operators.or(
                operators.gt(fields.updatedAt, priorDate),
                operators.gt(fields.createdAt, priorDate)
              )
            },
          }).then(res => res.map(
            item => ({
              id: item.id,
              title: item.field.name,
              type: "fieldMap" as const,
              createUserName: item.userCreated ? item.userCreated.name : null,
              updateUserName: item.userUpdated ? item.userUpdated.name : null,
              createUserId: item.createUserId,
              updateUserId: item.updateUserId,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            })
          ))

        const fieldMapPolygons = await tx
          .query.fieldMapPolygons.findMany({
            with: { 
              userCreated: true,
              userUpdated: true,
              area: true 
            },
            where(fields, operators) {
              return operators.or(
                operators.gt(fields.updatedAt, priorDate),
                operators.gt(fields.createdAt, priorDate)
              )
            },
          }).then(res => res.map(
            item => ({
              id: item.fieldMapId,
              title: item.area.name,
              type: "polygon" as const,
              createUserName: item.userCreated ? item.userCreated.name : null,
              updateUserName: item.userUpdated ? item.userUpdated.name : null,
              createUserId: item.createUserId,
              updateUserId: item.updateUserId,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            })
          ))

        const files = await tx
          .query.files.findMany({
            with: {
              userCreated: true,
              userUpdated: true,
            },
            where(fields, operators) {
              return operators.or(
                operators.gt(fields.updatedAt, priorDate),
                operators.gt(fields.createdAt, priorDate)
              )
            },
          }).then(res => res.map(
            item => ({
              id: item.id,
              title: item.originalName,
              type: "file" as const,
              createUserName: item.userCreated ? item.userCreated.name : null,
              updateUserName: item.userUpdated ? item.userUpdated.name : null,
              createUserId: item.createUserId,
              updateUserId: item.updateUserId,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt
            })
          ))

        return [...mapItems, ...clusters, ...companies, ...fields, ...licensedAreas, ...areasData, ...fieldsMaps, ...fieldMapPolygons, ...files]
      })
      return {
        data,
        error: null
      }
    } catch (error) {
      console.error(error)
      return { data: [], error: getErrorMessage(error) }
    }
  }

  const validateData = async () => {
    try {
      const allRecent = await unstable_cache(
        fetchData,
        [currentDate],
        { revalidate: 60, tags: ["map_items", "clusters", "companies", "fields", "licensed_areas", "areas_data", "fields_maps", "polygons", "files"] }
      )()

      if (allRecent.error !== null) return { data: [], pageCount: 0, error: allRecent.error };

      const sortedData = orderData(input.sort, allRecent.data)

      const paginated = paginate(sortedData, input)
      return { data: paginated.items, pageCount: paginated.totalPages, error: null }
    } catch (error) {
      return { data: [], pageCount: 0, error: getErrorMessage(error) }
    }
  }

  const result = await unstable_cache(
    validateData,
    [JSON.stringify(input), currentDate],
    { revalidate: 60, tags: ["map_items", "clusters", "companies", "fields", "licensed_areas", "areas_data", "fields_maps", "polygons", "files"] }
  )()

  return result
}


// Map item page
export async function getMapItemPage(id: string, fetchImages = true) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const mapItem = await getMapItem(id)

      if (mapItem.error !== null) throw new Error(mapItem.error);
      // if no mapItem found or it`s doesn't have companies throw to NotFound page
      if (!mapItem.data.companiesToMapItems[0]) throw new Error("Not Found");

      const title = mapItem.data.cluster?.name ?? mapItem.data.companiesToMapItems[0].company.name

      const fieldMaps = await Promise.all(
        mapItem.data.fields.map(async ({id, name, fieldMap}) => {
          if (fieldMap && fetchImages) {
            const fieldMapWithImage = await getFieldMapWithImage(fieldMap.id)
            if (fieldMapWithImage.error !== null) throw new Error(fieldMapWithImage.error);
            return {
              ...fieldMapWithImage.data,
              fieldName: name,
              hasMap: true as const,
            }
          } else {
            return {
              fieldId: id,
              fieldName: name,
              hasMap: false as const,
            }
          }
        })
      )

      if (fieldMaps.length === 0) throw new Error("Not Found");

      return { 
        data: { title, fieldMaps },
        error: null
      }
    } catch (error) {
      console.error(error)
      return { data: null, error: getErrorMessage(error) }
    }
  }

  const result = await fetchData()

  return result
}


// Area page
export async function getLicensedAreaPage(input: GetAreasDataSchema) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const licensedArea = await db.query.licensedAreas.findFirst({
        with: {
          field: true
        },
        where: eq(licensedAreas.id, input.areaId)
      })

      if (!licensedArea) throw new Error("Not Found");

      const mapItem = await db.query.mapItems.findFirst({
        with: {
          cluster: true,
          fields: {
            with: {
              company: true,
            },
          },
          companiesToMapItems: {
            with: {
              company: true
            }
          }
        },
        where: inArray(
          mapItems.id, 
          db
            .select({ mapItemId: fields.mapItemId })
            .from(fields)
            .where(eq(fields.id, licensedArea.field.id))
        ),
      })

      if (!mapItem?.companiesToMapItems[0]) throw new Error("Not Found");

      const titleMapItem = mapItem.cluster?.name ?? mapItem.companiesToMapItems[0].company.name
    
      const areaData = await getAreasData(input, "areaName")

      const names = {
        fieldName: licensedArea.field.name,
        areaName: licensedArea.name,
      }

      return { 
        data: { 
          mapItem: {
            id: mapItem.id,
            title: titleMapItem,
          }, 
          names,
          areaData
        },
        error: null
      }
    } catch (error) {
      console.error(error)
      return { data: null, error: getErrorMessage(error) }
    }
  }

  // await new Promise((resolve) => setTimeout(resolve, 2000))

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: false, tags: ["map_items", "clusters", "companies", "fields", "licensed_areas", "areas_data"] }
  )()

  return result
}