"use client"

import React from 'react'
import { DEFAULT_ITEM_SIZE } from '~/lib/intersections/get-intersections'
import { type MaxValue, type MapItemT } from '~/lib/types'
import { type getMap, type getMapItems } from '~/server/queries/map'
import dynamic from 'next/dynamic';
import useElementDimensions from '~/hooks/use-ellement-dimensions'
import { useSetAtom } from 'jotai'
import { mapContainerDimensions } from '~/lib/atoms/main'
import MapItemsFilters from '~/components/map/filters/map-items-filters'
import { extractKeys, findMaxValuesByRelevance } from '~/lib/utils'
import { useElementsSearch, useMapItemsSearch } from '~/components/map/filters/hooks'
import { type AreaData, type Profitability } from '~/server/db/schema'
import MapItemDrawer from '~/components/map/map-item-info/map-item-drawer'
import { type getProfitability } from '~/server/queries/profitability'

const MapStage = dynamic(() => import('~/components/map/map-stage'), {
  ssr: false,
});
const MapItems = dynamic(() => import('~/components/map/map-items'), {
  ssr: false,
});

interface MapProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getMapItems>>,
      Awaited<ReturnType<typeof getMap>>,
      Awaited<ReturnType<typeof getProfitability>>,
    ]
  >
}

export default function Map({ promises }: MapProps) {
  const { dimensions, ref } = useElementDimensions();
  const setContainerDimensions = useSetAtom(mapContainerDimensions)

  React.useEffect(() => {
    if (dimensions) setContainerDimensions(dimensions)
  }, [dimensions, setContainerDimensions])

  const [data, { data: mapData }, { data: profitability }] = React.use(promises)

  const [elementsSearch] = useElementsSearch()

  const [{elements: elementsComparison}] = useMapItemsSearch()

  const getMaxValuesByRelevance = React.useCallback(
    (areasData: AreaData[]) => {
      if (!profitability[0]) return {
        original: [],
        filtered: []
      };

      const filteredAreasData = !!elementsSearch && elementsSearch.length > 0
        ? extractKeys(areasData, elementsSearch)
        : areasData

      const original = findMaxValuesByRelevance(areasData, profitability[0])
      const filtered = findMaxValuesByRelevance(filteredAreasData, profitability[0])

      return {
        original,
        filtered,
      }
    },
    [elementsSearch, profitability]
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

  const itemsData: MapItemT[] = React.useMemo(
    () => data.map((item) => {

      const maxValues = getMaxValuesByRelevance(item.areasData)

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
    }).filter((item) => item.maxElements.filtered.length !== 0),
    [data, getFirstFiveMaxValues, getMaxValuesByRelevance]
  );

  return (
    <div className='w-full h-full flex flex-col gap-2 flex-grow'>
      <div ref={ref} className='w-full h-full flex-grow bg-muted'>
        <MapItemDrawer />
        <MapStage
          mapData={mapData}
          actions={<MapItemsFilters />}
          className='w-full'
        >
          <MapItems items={itemsData} />
        </MapStage>
      </div>
    </div>
  )
}
