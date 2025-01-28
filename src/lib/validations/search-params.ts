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
  } from "nuqs/server"
import { getFiltersStateParser, getSortingStateParser } from "~/lib/parsers";
import { type AreasDataExtend, type Company, type FieldsExtend, type LicensedAreasExtend, type SessionExtend, type User, users } from "~/server/db/schema";

export const searchParamsUsers = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<User>().withDefault([
    { id: "id", desc: false },
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
    { id: "userId", desc: false }
  ]),
  userId: parseAsString.withDefault(""),
  name: parseAsString.withDefault(""),
  role: parseAsArrayOf(z.enum(users.role.enumValues)).withDefault([]),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
}
export const searchParamsSessionsCache = createSearchParamsCache(searchParamsSessions)

export const searchParamsCompanies = {
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Company>().withDefault([
    { id: "id", desc: false }
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
  sort: getSortingStateParser<FieldsExtend>().withDefault([
    { id: "id", desc: false }
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
  sort: getSortingStateParser<LicensedAreasExtend>().withDefault([
    { id: "id", desc: false }
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
  sort: getSortingStateParser<AreasDataExtend>().withDefault([
    { id: "id", desc: false }
  ]),
  id: parseAsString.withDefault(""),
  areaName: parseAsString.withDefault(""),
  areaId: parseAsString.withDefault(""),
  fieldId: parseAsString.withDefault(""),
  fieldName: parseAsString.withDefault(""),
  companyId: parseAsString.withDefault(""),
  companyName: parseAsString.withDefault(""),
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),  
}
export const searchAreasDataCache = createSearchParamsCache(searchAreasData)


// API Routes
export const searchClustersApi = {
  hasMapItem: parseAsBoolean
}
export const searchClustersApiLoader = createLoader(searchClustersApi)

export const searchCompaniesApi = {
  hasMapItem: parseAsBoolean
}
export const searchCompaniesApiLoader = createLoader(searchCompaniesApi)

