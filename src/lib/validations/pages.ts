import { type searchParamsRecentCache } from "./search-params";

export type GetRecentSchema = Awaited<ReturnType<typeof searchParamsRecentCache.parse>>