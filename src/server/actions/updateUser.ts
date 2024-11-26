"use server"

import { revalidateTag, unstable_noStore } from "next/cache"
import { type UpdateUserSchema } from "~/lib/validations/users"
import { db } from "../db"
import { users } from "../db/schema"
import { eq } from "drizzle-orm"
import { takeFirstOrThrow } from "../db/utils"
import { getErrorMessage } from "~/lib/handle-error"

export async function updateUser(input: UpdateUserSchema & { id: string }) {
    unstable_noStore()
    try {
      const data = await db
        .update(users)
        .set({
          role: input.role
        })
        .where(eq(users.id, input.id))
        .returning()
        .then(takeFirstOrThrow)
  
      revalidateTag("users")
      if (data.role === input.role) {
        revalidateTag("users-role-counts")
      }
  
      return {
        data: null,
        error: null,
      }
    } catch (err) {
      return {
        data: null,
        error: getErrorMessage(err),
      }
    }
  }