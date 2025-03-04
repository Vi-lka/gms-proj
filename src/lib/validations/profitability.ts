import { type searchParamsProfitabilityCache } from "./search-params";

export type GetProfitabilitySchema = Awaited<ReturnType<typeof searchParamsProfitabilityCache.parse>>