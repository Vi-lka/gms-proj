import { z } from "zod";
import {
    createSearchParamsCache,
    parseAsArrayOf,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
  } from "nuqs/server"
import { getFiltersStateParser, getSortingStateParser } from "~/lib/parsers";
import { type Session, type User, users } from "~/server/db/schema";

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
  sort: getSortingStateParser<Session>().withDefault([
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