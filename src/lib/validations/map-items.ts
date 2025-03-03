import { type searchParamsMapItemsCache } from "./search-params";

export type GetMapItemsSchema = Awaited<ReturnType<typeof searchParamsMapItemsCache.parse>>