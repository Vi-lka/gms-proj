import { type searchLicensedAreasCache } from "./search-params";

export type GetLicensedAreasSchema = Awaited<ReturnType<typeof searchLicensedAreasCache.parse>>
