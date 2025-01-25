"use server"

import { unstable_noStore as noStore, revalidateTag } from "next/cache"
import { type UpdateClusterSchema, type CreateClusterSchema, type MapItemSchema, type CompanySchema, type UpdateCompanySchema } from "~/lib/validations/forms";
import { auth } from "../auth";
import { getErrorMessage } from "~/lib/handle-error";
import { db } from "../db";
import { clusters, companies, companiesToClusters, companiesToMapItems, mapItems } from "../db/schema";
import { takeFirstOrThrow, updateInManySql } from "../db/utils";
import { and, eq, inArray } from "drizzle-orm";

// export async function createCluster({
//   input,
//   mapItem
// }: {
//   input: CreateClusterSchema,
//   mapItem: MapItemSchema
// }) {
//   noStore()

//   const session = await auth();
//   if (session?.user.role !== "admin") {
//     const err = new Error("No access")
//     return {
//       data: null,
//       error: getErrorMessage(err)
//     }
//   }

//   try {
//     const result = await db.transaction(async (tx) => {
//       const clusterRes = await tx
//         .insert(clusters)
//         .values({
//           name: input.name,
//           description: input.description,
//         })
//         .returning()
//         .then(takeFirstOrThrow)

//       const newMapItem = await tx
//         .insert(mapItems)
//         .values({
//           clusterId: clusterRes.id,
//           description: mapItem.description,
//           xPos: mapItem.xPos,
//           yPos: mapItem.yPos
//         })
//         .returning()
//         .then(takeFirstOrThrow)

//       const companiesInput = input.companies.map(company => ({
//         ...company,
//         clusterId: clusterRes.id,
//         mapItemId: newMapItem.id,
//       }))

//       await tx
//         .insert(companies)
//         .values(companiesInput)

//       revalidateTag("map_items")

//       return {
//         data: null,
//         error: null,
//       }
//     })

//     return result
//   } catch (err) {
//     return {
//       data: null,
//       error: getErrorMessage(err),
//     }
//   }
// }