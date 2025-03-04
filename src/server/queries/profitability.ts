"use server"

import "server-only"
import { type GetProfitabilitySchema } from "~/lib/validations/profitability";
import { auth } from "../auth";
import { restrictUser } from "~/lib/utils";
import { eq } from "drizzle-orm";
import { profitability } from "../db/schema";
import { db } from "../db";
import { unstable_cache } from "~/lib/unstable-cache";

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
          where
        })

      if (!data) return { data: [], pageCount: 0 };

      return { data: [data], pageCount: 1 }
    } catch (err) {
      console.error(err)
      return { data: [], pageCount: 0 }
    }
  }
  
  const result = await unstable_cache(
    fetchData,
    [JSON.stringify(input)],
    { revalidate: 60, tags: ["profitability"] }
  )()
  
  return result
}
