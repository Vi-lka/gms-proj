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
import { eq, inArray } from "drizzle-orm";
import { fields, licensedAreas, mapItems } from "../db/schema";
import { unstable_cache } from "~/lib/unstable-cache";

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

// export async function getAreaPage(mapItemId: string, input: GetAreasDataSchema) {
//   const session = await auth();
//   if (restrictUser(session?.user.role, 'content')) {
//     throw new Error("No access");
//   }

//   const fetchData = async () => {
//     try {
//       const mapItem = await getMapItem(mapItemId)

//       if (mapItem.error !== null) throw new Error(mapItem.error);
//       // if no mapItem found or it`s doesn't have companies throw to NotFound page
//       if (!mapItem.data.companiesToMapItems[0]) notFound();
    
//       const titleMapItem = mapItem.data.cluster?.name ?? mapItem.data.companiesToMapItems[0].company.name
    
//       const areaData = await getAreasData(input)

//       return { 
//         data: { 
//           titleMapItem, 
//           areaData 
//         },
//         error: null
//       }
//     } catch (error) {
//       console.error(error)
//       return { data: null, error: getErrorMessage(error) }
//     }
//   }

//   const result = await fetchData()

//   return result
// }

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
    
      const areaData = await getAreasData(input)

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
    { revalidate: 60, tags: ["map_items"] }
  )()

  return result
}