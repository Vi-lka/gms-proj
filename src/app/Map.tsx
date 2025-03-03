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
import { extractKeys, findMaxValuesByRelevance, testProfitability } from '~/lib/utils'
import { useElementsSearch, useMapItemsSearch } from '~/components/map/filters/hooks'
import { type AreaData } from '~/server/db/schema'
import MapItemDrawer from '~/components/map/map-item-info/map-item-drawer'

const MapStage = dynamic(() => import('~/components/map/map-stage'), {
  ssr: false,
});
const MapItems = dynamic(() => import('~/components/map/map-items'), {
  ssr: false,
});

interface MapProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getMap>>,
      Awaited<ReturnType<typeof getMapItems>>,
    ]
  >
}

export default function Map({ promises }: MapProps) {
  const { dimensions, ref } = useElementDimensions();
  const setContainerDimensions = useSetAtom(mapContainerDimensions)

  React.useEffect(() => {
    if (dimensions) setContainerDimensions(dimensions)
  }, [dimensions, setContainerDimensions])

  const [{ data: mapData }, data] = React.use(promises)

  const [elementsSearch] = useElementsSearch()

  const [{elements: elementsComparison}] = useMapItemsSearch()

  const getMaxValuesByRelevance = React.useCallback(
    (areasData: AreaData[]) => {
      const filteredAreasData = !!elementsSearch && elementsSearch.length > 0
      ? extractKeys(areasData, elementsSearch)
      : areasData

      return findMaxValuesByRelevance(filteredAreasData, testProfitability)
    },
    [elementsSearch]
  )

  const getFirstFiveMaxValues = React.useCallback(
    (maxValues: MaxValue<typeof testProfitability>[]) => {
      const firstFiveMaxValues = maxValues.slice(0, 5);

      if (elementsComparison && elementsComparison.length > 0) {
        elementsComparison.forEach((comparison, searchIndx) => {
          const index = maxValues.findIndex(item => item.key === comparison.element)
          if (index > 5 && !!maxValues[index]) {
            firstFiveMaxValues.splice(4 - searchIndx, 1, maxValues[index])
          }
        })

        firstFiveMaxValues.sort((a, b) => b.weightedValue - a.weightedValue);
      }

      return firstFiveMaxValues
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
    }).filter((item) => item.maxElements.length !== 0),
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
