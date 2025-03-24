import type { searchParamsSessionsCache, searchParamsUsersCache } from "./search-params"

export type GetUsersSchema = Awaited<ReturnType<typeof searchParamsUsersCache.parse>>

export type GetSessionsSchema = Awaited<ReturnType<typeof searchParamsSessionsCache.parse>>
