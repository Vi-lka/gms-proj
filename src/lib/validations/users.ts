import { z } from "zod"
import type { searchParamsSessionsCache, searchParamsUsersCache } from "./search-params"
import { users } from "~/server/db/schema"

export type GetUsersSchema = Awaited<ReturnType<typeof searchParamsUsersCache.parse>>

export const updateUserSchema = z.object({
  role: z.enum(users.role.enumValues).optional(),
})
export type UpdateUserSchema = z.infer<typeof updateUserSchema>

export type GetSessionsSchema = Awaited<ReturnType<typeof searchParamsSessionsCache.parse>>
