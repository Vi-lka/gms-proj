"use server"

import "server-only"

import { type GetFilesSchema } from "~/lib/validations/files";
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { and, ilike, inArray, or } from "drizzle-orm";
import { fieldsMaps, files, users } from "../db/schema";
import { db } from "../db";
import { getRelationOrderBy, orderData, paginate } from "../db/utils";
import { getPresignedUrl } from "../s3-bucket/queries";
import { getErrorMessage } from "~/lib/handle-error";
import { unstable_cache } from "~/lib/unstable-cache";

export async function getFiles(
  input: GetFilesSchema,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'admin-panel')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {
      // const offset = (input.page - 1) * input.perPage

      const where = and(
          input.fileName ? or(
            ilike(files.id, `%${input.fileName}%`),
            ilike(files.fileName, `%${input.fileName}%`),
            ilike(files.originalName, `%${input.fileName}%`),
            inArray(
              files.id,
              db
                .select({ id: fieldsMaps.fileId })
                .from(fieldsMaps)
                .where(
                  or(
                    ilike(fieldsMaps.name, `%${input.fileName}%`),
                    ilike(fieldsMaps.id, `%${input.fileName}%`),
                  )
                )
            ),
            inArray(
              files.createUserId,
              db
                .select({ id: users.id })
                .from(users)
                .where(
                  or(
                    ilike(users.name, `%${input.fileName}%`),
                    ilike(users.id, `%${input.fileName}%`),
                  )
                )
            ),
            inArray(
              files.updateUserId,
              db
                .select({ id: users.id })
                .from(users)
                .where(
                  or(
                    ilike(users.name, `%${input.fileName}%`),
                    ilike(users.id, `%${input.fileName}%`),
                  )
                )
            )
          ) : undefined,
        )

      const { orderBy } = getRelationOrderBy(input.sort, files, files.id)

      const { data, pageCount } = await db.transaction(async (tx) => {
        const data = await tx
          .query.files.findMany({
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
              fieldMap: true
            }
          })

        // const total = await tx
        //   .select({
        //     count: count(),
        //   })
        //   .from(fieldsMaps)
        //   .where(where)
        //   .execute()
        //   .then((res) => res[0]?.count ?? 0)

        const validData = await Promise.all(
          data.map(async ({userCreated, userUpdated, fieldMap, ...other}) => {
            const fileUrl = await getPresignedUrl(other.id)
            if (fileUrl.error !== null) throw new Error(fileUrl.error)
            return {
              ...other,
              createUserName: userCreated ? userCreated.name : null,
              updateUserName: userUpdated ? userUpdated.name : null,
              fileUrl: fileUrl.data,
              fieldMapId: fieldMap?.id,
              fieldMapName: fieldMap?.name
            }
          })
        )
  
        const sortedData = orderData(input.sort, validData)

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

  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: 60, tags: ["files"] }
  )()

  return result
}