"use client"

import React from 'react'
import { DEFAULT_ITEM_SIZE } from '~/lib/intersections/get-intersections'
import { type MapItemT } from '~/lib/types'
import { type getMap, type getMapItems } from '~/server/queries/map'
import dynamic from 'next/dynamic';
import useElementDimensions from '~/hooks/use-ellement-dimensions'
import { useSetAtom } from 'jotai'
import { mapContainerDimensions } from '~/lib/atoms/main'

const MainStageAdmin = dynamic(() => import('~/components/map/main-stage-admin'), {
  ssr: false,
});

const MapAdminToolbar = dynamic(() => import('~/components/map/toolbar/map-admin-toolbar'), {
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

  const [{ data: mapData }, { data, total }] = React.use(promises)

  const itemsData: MapItemT[] = React.useMemo(
    () => data.map((item) => ({
      id: item.id,
      names: item.companies.map(company => company.name),
      x: item.xPos,
      y: item.yPos,
      width: DEFAULT_ITEM_SIZE.width,
      height: DEFAULT_ITEM_SIZE.height,
    })),
    [data]
  );

  return (
    <div className='w-full h-full flex flex-col gap-2 flex-grow'>
      <MapAdminToolbar />
      <div ref={ref} className='w-full h-full flex-grow border rounded-xl overflow-hidden'>
        <MainStageAdmin items={itemsData} mapData={mapData} className='w-full' />
      </div>
    </div>
  )
}
