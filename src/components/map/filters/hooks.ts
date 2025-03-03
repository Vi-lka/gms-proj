"use client"

import { parseAsArrayOf, parseAsStringEnum, useQueryState, useQueryStates } from "nuqs";
import { ELEMENTS } from "~/lib/static/elements";
import { searchParamsMapItems } from "~/lib/validations/search-params";

export function useElementsSearch() {
  return useQueryState('elements-view', parseAsArrayOf(parseAsStringEnum<ELEMENTS>(Object.values(ELEMENTS))))
}

export function useMapItemsSearch() {
  return useQueryStates(searchParamsMapItems, {shallow: false, history: "push"})
}