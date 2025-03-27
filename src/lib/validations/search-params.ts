/* eslint-disable @typescript-eslint/unbound-method */
import { z } from "zod";
import {
    createSearchParamsCache,
    createLoader,
    parseAsArrayOf,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
    parseAsBoolean,
    parseAsJson,
    createSerializer,
  } from "nuqs/server"
import { getFiltersStateParser, getSortingStateParser } from "~/lib/parsers";
import { 
  type AreaDataExtend, 
  type Company, 
  type FieldExtend, 
  type FieldMapExtend,  
  type FileDBExtend, 
  type LicensedAreaExtend,
  type MapDataExtend,
  type SessionExtend, 
  type User, 
  users 
} from "~/server/db/schema";
import { ELEMENTS } from "../static/elements";
import { type RecentItem } from "../types";

export const searchParamsUsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<User>().withDefault([
    { id: "name", desc: false },
  ]),
  id: parseAsString.withDefault(""),
  name: parseAsString.withDefault(""),
  role: parseAsArrayOf(z.enum(users.role.enumValues)).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}
export const searchParamsUsersCache = createSearchParamsCache(searchParamsUsers)

export const searchParamsSessions = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<SessionExtend>().withDefault([
    { id: "name", desc: false }
  ]),
  userId: parseAsString.withDefault(""),
  name: parseAsString.withDefault(""),
  role: parseAsArrayOf(z.enum(users.role.enumValues)).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}
export const searchParamsSessionsCache = createSearchParamsCache(searchParamsSessions)

export const searchParamsMaps = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<MapDataExtend>().withDefault([
    { id: "selected", desc: false }
  ]),
  id: parseAsString.withDefault(""),
  selected: parseAsBoolean,
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}
export const searchParamsMapsCache = createSearchParamsCache(searchParamsMaps)

export const elementsSearchSchema = z.object({
  id: z.string(),
  element: z.nativeEnum(ELEMENTS).nullable(),
  max: z.number().nullable(),
  min: z.number().nullable(),
})
export type ElementsSearchSchema = z.infer<typeof elementsSearchSchema>;

export const searchParamsMapItems = {
  search: parseAsString,
  comapniesIds: parseAsArrayOf(parseAsString),
  // eslint-disable-next-line @typescript-eslint/unbound-method
  elements: parseAsArrayOf(parseAsJson(elementsSearchSchema.parse)),
}
export const loadSearchParamsMapItems = createLoader(searchParamsMapItems)
export const searchParamsMapItemsCache = createSearchParamsCache(searchParamsMapItems)

export const searchParamsCompanies = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Company>().withDefault([
    { id: "name", desc: false }
  ]),
  id: parseAsString.withDefault(""),
  name: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}
export const searchParamsCompaniesCache = createSearchParamsCache(searchParamsCompanies)

export const searchParamsFields = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<FieldExtend>().withDefault([
    { id: "name", desc: false }
  ]),
  id: parseAsString.withDefault(""),
  name: parseAsString.withDefault(""),
  companyId: parseAsString.withDefault(""),
  companyName: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),  
}
export const searchParamsFieldsCache = createSearchParamsCache(searchParamsFields)

export const searchLicensedAreas = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<LicensedAreaExtend>().withDefault([
    { id: "name", desc: false }
  ]),
  id: parseAsString.withDefault(""),
  name: parseAsString.withDefault(""),
  fieldId: parseAsString.withDefault(""),
  fieldName: parseAsString.withDefault(""),
  companyId: parseAsString.withDefault(""),
  companyName: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}
export const searchLicensedAreasCache = createSearchParamsCache(searchLicensedAreas)

export const searchAreasData = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<AreaDataExtend>().withDefault([
    { id: "companyName", desc: false }
  ]),
  id: parseAsString.withDefault(""),
  areaName: parseAsString.withDefault(""),
  areaId: parseAsString.withDefault(""),
  fieldId: parseAsString.withDefault(""),
  fieldsIds: parseAsArrayOf(parseAsString),
  fieldName: parseAsString.withDefault(""),
  companyId: parseAsString.withDefault(""),
  companyName: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}
export const searchAreasDataCache = createSearchParamsCache(searchAreasData)
export const searchAreasDataSerialize = createSerializer(searchAreasData)

export const searchFieldsMaps = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<FieldMapExtend>().withDefault([
    { id: "fieldName", desc: false }
  ]),
  id: parseAsString.withDefault(""),
  name: parseAsString.withDefault(""),
  fieldId: parseAsString.withDefault(""),
  fieldName: parseAsString.withDefault(""),
  companyId: parseAsString.withDefault(""),
  companyName: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}
export const searchFieldsMapsCache = createSearchParamsCache(searchFieldsMaps)

export const searchParamsProfitability = {
  id: parseAsString.withDefault(""),
}
export const searchParamsProfitabilityCache = createSearchParamsCache(searchParamsProfitability)

export const searchParamsFiles = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<FileDBExtend>().withDefault([
    { id: "originalName", desc: false }
  ]),
  id: parseAsString.withDefault(""),
  fileName: parseAsString.withDefault(""),
  hasConnected: parseAsStringEnum(["true", "false", "disabled"]).withDefault("disabled"),
  format: parseAsArrayOf(parseAsStringEnum(["jpg", "jpeg", "png", "svg"])).withDefault([]),
  maxSize: parseAsInteger,
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}
export const searchParamsFilesCache = createSearchParamsCache(searchParamsFiles)
export const searchFilesSerialize = createSerializer(searchParamsFiles)

export const searchParamsRecent = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<RecentItem>().withDefault([
    { id: "updatedAt", desc: true }
  ]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}
export const searchParamsRecentCache = createSearchParamsCache(searchParamsRecent)


// API Routes
export const searchClustersApi = {
  hasMapItem: parseAsBoolean,
}
export const searchClustersApiLoader = createLoader(searchClustersApi)

export const searchCompaniesApi = {
  hasMapItem: parseAsBoolean,
}
export const searchCompaniesApiLoader = createLoader(searchCompaniesApi)

export const searchFieldsApi = {
  hasMapItem: parseAsBoolean,
  hasFieldMap: parseAsBoolean,
  mapItemId: parseAsString,
  companyId: parseAsString,
  fieldsIds: parseAsArrayOf(parseAsString)
}
export const searchFieldsApiLoader = createLoader(searchFieldsApi)

export const searchLicensedAreasApi = {
  fieldId: parseAsString,
}
export const searchLicensedAreasApiLoader = createLoader(searchLicensedAreasApi)

export const searchAreasDataApiLoader = createLoader(searchAreasData)

export const searchFilesApiLoader = createLoader(searchParamsFiles)


// TABS and VIEW
export const searchParamsTabs = {
  tab: parseAsString,
  view: parseAsStringEnum(["first", "second"]).withDefault("first"),
}
export const searchParamsTabsCache = createSearchParamsCache(searchParamsTabs)
export const searchParamsTabsLoader = createLoader(searchParamsTabs)
export const searchParamsTabsSerialize = createSerializer(searchParamsTabs)