import { type searchFieldsMapsCache } from "./search-params";

export type GetFieldsMapsSchema = Awaited<ReturnType<typeof searchFieldsMapsCache.parse>>