import { type searchParamsCompaniesCache } from "./search-params";

export type GetCompaniesSchema = Awaited<ReturnType<typeof searchParamsCompaniesCache.parse>>