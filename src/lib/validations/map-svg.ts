import { type searchParamsMapsCache } from "./search-params";

export type GetMapsSchema = Awaited<ReturnType<typeof searchParamsMapsCache.parse>>