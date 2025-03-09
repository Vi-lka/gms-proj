"use server"

import "server-only"
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { notFound } from "next/navigation";
import { getErrorMessage } from "~/lib/handle-error";
import { getFieldMapWithImage } from "./fields-maps";
import { getMapItem } from "./map";
import { getAreasData } from "./area-data";
import { GetAreasDataSchema } from "~/lib/validations/areas-data";
import { map } from "zod";
import { title } from "process";

export async function getMapItemPage(id: string) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const mapItem = await getMapItem(id)

      if (mapItem.error !== null) throw new Error(mapItem.error);
      // if no mapItem found or it`s doesn't have companies throw to NotFound page
      if (!mapItem.data.companiesToMapItems[0]) notFound();

      const title = mapItem.data.cluster?.name ?? mapItem.data.companiesToMapItems[0].company.name

      const fieldMaps = await Promise.all(
        mapItem.data.fields.map(async ({id, name, fieldMap}) => {
          if (fieldMap) {
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

      if (fieldMaps.length === 0) notFound();

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

export async function getAreaPage(mapItemId: string, input: GetAreasDataSchema) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      const mapItem = await getMapItem(mapItemId)

      if (mapItem.error !== null) throw new Error(mapItem.error);
      // if no mapItem found or it`s doesn't have companies throw to NotFound page
      if (!mapItem.data.companiesToMapItems[0]) notFound();
    
      const titleMapItem = mapItem.data.cluster?.name ?? mapItem.data.companiesToMapItems[0].company.name
    
      const areaData = await getAreasData(input)

      return { 
        data: { 
          titleMapItem, 
          areaData 
        },
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