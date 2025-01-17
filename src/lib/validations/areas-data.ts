import { type searchAreasDataCache } from "./search-params";

export type GetAreasDataSchema = Awaited<ReturnType<typeof searchAreasDataCache.parse>>