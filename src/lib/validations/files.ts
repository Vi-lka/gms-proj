import { type searchParamsFilesCache } from "./search-params";

export type GetFilesSchema = Awaited<ReturnType<typeof searchParamsFilesCache.parse>>