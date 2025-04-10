"use client"

import { useQueryStates } from "nuqs";
import React from "react";
import { DEFAULT_ITEM_SIZE } from "~/lib/intersections/get-intersections";
import { type MapItemT, type MaxValue } from "~/lib/types";
import { extractKeys, findMaxValuesByRelevance } from "~/lib/utils";
import { type ElementsSearchSchema, searchParamsMapItems } from "~/lib/validations/search-params";
import { type AreaData, type Profitability } from "~/server/db/schema";
import { type getMapItems } from "~/server/queries/map";
import { type getProfitability } from "~/server/queries/profitability";

export function useMapItemsSearch() {
  return useQueryStates(searchParamsMapItems)
}

export function useMapItems(
  data: Awaited<ReturnType<typeof getMapItems>>['data'], 
  profitability: Awaited<ReturnType<typeof getProfitability>>['data'],
  filterByElements = true
) {
  const [{search, companiesIds, elements: elementsComparison, elementsView}] = useMapItemsSearch()

  const getMaxValuesByRelevance = React.useCallback(
    (areasData: AreaData[]) => {
      if (!profitability[0]) return {
        original: [],
        filtered: []
      };

      const filteredAreasData = !!elementsView && elementsView.length > 0
        ? extractKeys(areasData, elementsView)
        : areasData

      const original = findMaxValuesByRelevance(areasData, profitability[0])
      const filtered = findMaxValuesByRelevance(filteredAreasData, profitability[0])

      return {
        original,
        filtered,
      }
    },
    [elementsView, profitability]
  )

  const getFirstFiveMaxValues = React.useCallback(
    (maxValues: {
      original: MaxValue<Profitability>[],
      filtered: MaxValue<Profitability>[],
    }) => {
      const original = maxValues.original.splice(0, 5).sort((a, b) => b.weightedValue - a.weightedValue)
      const firstFiveMaxValues = maxValues.filtered.slice(0, 5);

      if (elementsComparison && elementsComparison.length > 0) {
        elementsComparison.forEach((comparison, searchIndx) => {
          const index = maxValues.filtered.findIndex(item => item.key === comparison.element)
          if (index > 5 && !!maxValues.filtered[index]) {
            firstFiveMaxValues.splice(4 - searchIndx, 1, maxValues.filtered[index])
          }
        })

        firstFiveMaxValues.sort((a, b) => b.weightedValue - a.weightedValue);
      }

      return {
        original,
        filtered: firstFiveMaxValues
      }
    },
    [elementsComparison]
  )

  const  compareElements = (
    items: AreaData[],
    input: ElementsSearchSchema[] | null
  ) => {
    if (!input || input.length === 0) return items
    return items.filter(row => {
      return input.every(item => {
        // Skip if element is null
        if (item.element === null) return true;
  
        const value = row[item.element];
        // Handle cases where value might be null/undefined
        if (value === null || value === undefined) return false;
  
        // Check max condition if specified
        if (item.max !== null && value > item.max) return false;
        
        // Check min condition if specified
        if (item.min !== null && value < item.min) return false;
  
        return true;
      });
    });
  }

  const itemsData: MapItemT[] = React.useMemo(
    () => data.map((item) => {

      const areasData = compareElements(item.areasData, elementsComparison)

      const maxValues = getMaxValuesByRelevance(areasData)

      const firstFiveMaxValues = getFirstFiveMaxValues(maxValues);

      return {
        ...item,
        companies: item.companiesToMapItems.map(ctmi => {
          const companyFields = item.fields.filter(field => field.companyId === ctmi.companyId)
          return {
            ...ctmi.company,
            fields: companyFields
          }
        }).sort((a, b) => a.name.localeCompare(b.name)),
        maxElements: firstFiveMaxValues,
        x: item.xPos,
        y: item.yPos,
        width: DEFAULT_ITEM_SIZE.width,
        height: DEFAULT_ITEM_SIZE.height,
      }
    }).filter((item) => 
      filterByElements ? item.maxElements.filtered.length !== 0 : true
    ),
    [data, elementsComparison, filterByElements, getFirstFiveMaxValues, getMaxValuesByRelevance]
  );

  function filterMapItems(
    itemsData: MapItemT[],
    search: string | null,
    companiesIds: string[] | null
  ): MapItemT[] {
    return itemsData.filter(item => {
      // Apply companiesIds filter if provided
      if (companiesIds && companiesIds.length > 0) {
        const itemCompanyIds = item.companies.map(company => company.id);
        const hasMatchingCompany = itemCompanyIds.some(id => companiesIds.includes(id));
        if (!hasMatchingCompany) return false;
      }
  
      // Apply search filter if provided
      if (search && search.trim().length > 0) {
        const searchLower = search.trim().toLowerCase();
  
        // Check all string fields
        const matchesSearch =
          // Top-level fields
          item.id.toLowerCase().includes(searchLower) ||
          // Companies
          item.companies.some(company =>
            company.id.toLowerCase().includes(searchLower) ||
            company.name.toLowerCase().includes(searchLower) ||
            (company.description?.toLowerCase().includes(searchLower) ?? false)
          ) ||
          // Fields and their LicensedAreas
          item.fields.some(field =>
            field.id.toLowerCase().includes(searchLower) ||
            field.name.toLowerCase().includes(searchLower) ||
            (field.description?.toLowerCase().includes(searchLower) ?? false) ||
            field.licensedAreas.some(la =>
              la.id.toLowerCase().includes(searchLower) ||
              la.name.toLowerCase().includes(searchLower) ||
              (la.description?.toLowerCase().includes(searchLower) ?? false)
            )
          ) ||
          // Cluster
          (item.cluster &&
            (item.cluster.id.toLowerCase().includes(searchLower) ||
             item.cluster.name.toLowerCase().includes(searchLower) ||
             (item.cluster.description?.toLowerCase().includes(searchLower) ?? false)));
  
        return matchesSearch;
      }
  
      // If no filters or only companiesIds was applied and passed
      return true;
    });
  }

  return filterMapItems(itemsData, search, companiesIds)
}