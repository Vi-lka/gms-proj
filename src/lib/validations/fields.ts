import { type searchParamsFieldsCache } from "./search-params";

export type GetFieldsSchema = Awaited<ReturnType<typeof searchParamsFieldsCache.parse>>