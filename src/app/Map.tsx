"use client"

import React from 'react'
import { DEFAULT_ITEM_SIZE } from '~/lib/intersections/get-intersections'
import { type MapItemT } from '~/lib/types'
import { type getMap, type getMapItems } from '~/server/queries/map'
import dynamic from 'next/dynamic';
import useElementDimensions from '~/hooks/use-ellement-dimensions'
import { useSetAtom } from 'jotai'
import { mapContainerDimensions } from '~/lib/atoms/main'

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

  const [{ data: mapData }, { data }] = React.use(promises)

  const itemsData: MapItemT[] = React.useMemo(
    () => data.map((item) => ({
      id: item.id,
      cluster: item.cluster,
      companies: item.companiesToMapItems.map(ctmi => {
        const companyFields = item.fields.filter(field => field.companyId === ctmi.companyId)
        return {
          ...ctmi.company,
          fields: companyFields
        }
      }),
      fields: item.fields,
      x: item.xPos,
      y: item.yPos,
      width: DEFAULT_ITEM_SIZE.width,
      height: DEFAULT_ITEM_SIZE.height,
    })),
    [data]
  );

  return (
    <div className='w-full h-full flex flex-col gap-2 flex-grow'>
      {/* <MapToolbarAdmin /> */}
      <div ref={ref} className='w-full h-full flex-grow bg-muted'>
        <MapStage
          mapData={mapData}
          // actions={<MapItemsActionsAdmin />}
          className='w-full'
        >
          <MapItems items={itemsData} />
        </MapStage>
      </div>
    </div>
  )
}
