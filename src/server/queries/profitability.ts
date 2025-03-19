"use server"

import "server-only"
import { type GetProfitabilitySchema } from "~/lib/validations/profitability";
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { eq } from "drizzle-orm";
import { profitability } from "../db/schema";
import { db } from "../db";
import { unstable_cache } from "~/lib/unstable-cache";
import { getErrorMessage } from "~/lib/handle-error";

export async function getProfitability(
  input?: GetProfitabilitySchema,
) {
  const session = await auth();
  if (restrictUser(session?.user.role, 'content')) {
    throw new Error("No access");
  }

  const fetchData = async () => {
    try {  
      const where = input?.id ? eq(profitability.id, input.id) : undefined

      const data = await db
        .query.profitability.findFirst({
          where,
          with: {
            userCreated: {
              columns: { name: true }
            },
            userUpdated: {
              columns: { name: true }
            }
          }
        })

      if (!data) return { data: [], pageCount: 0, error: null };

      const {userCreated, userUpdated, ...other} = data

      const transformData = {
        ...other,
        createUserName: userCreated ? userCreated.name : null,
        updateUserName: userUpdated ? userUpdated.name : null,
      }

      return { data: [transformData], pageCount: 1, error: null }
    } catch (err) {
      console.error(err)
      return { data: [], pageCount: 0, error: getErrorMessage(err) }
    }
  }
  
  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: 60, tags: ["profitability"] }
  )()
  
  return result
}
