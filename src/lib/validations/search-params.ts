import { z } from "zod";
import {
    createSearchParamsCache,
    parseAsArrayOf,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
  } from "nuqs/server"
import { getFiltersStateParser, getSortingStateParser } from "~/lib/parsers";
import { type User, users } from "~/server/db/schema";

export const searchParamsUsersCache = createSearchParamsCache({
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
})