"use client"

import React from 'react'
import { type getMapItems } from '~/server/queries/map'
import { type getMap } from '~/server/queries/map-svg'
import dynamic from 'next/dynamic';
import useElementDimensions from '~/hooks/use-ellement-dimensions'
import { useSetAtom } from 'jotai'
import { mapContainerDimensions } from '~/lib/atoms/main'
import { type getProfitability } from '~/server/queries/profitability'
import { toast } from 'sonner'

const MapStage = dynamic(() => import('~/components/map/map-stage'), {
  ssr: false,
});
const MapToolbarAdmin = dynamic(() => import('~/components/map/toolbar/map-toolbar-admin'), {
  ssr: false,
});
const MapItemsActionsAdmin = dynamic(() => import('~/components/map/actions/map-items-actions-admin'), {
  ssr: false,
});
const MapItemsAdmin = dynamic(() => import('~/components/map/map-items-admin'), {
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

  const [
    { data, error }, 
    { data: mapData, error: mapDataError }, 
    { data: profitability, error: profitabilityError }
  ] = React.use(promises)

  React.useEffect(() => {
    if (error !== null) toast.error(error, { id: "data-error", duration: 5000, dismissible: true })
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  React.useEffect(() => {
    if (mapDataError !== null) toast.error(mapDataError, { id: "map-data-error", duration: 5000, dismissible: true })
    return () => { 
      if (mapDataError !== null) toast.dismiss("map-data-error")
    }
  }, [mapDataError])

  React.useEffect(() => {
    if (profitabilityError !== null) toast.error(profitabilityError, { id: "profitability-error", duration: 5000, dismissible: true })
    return () => { 
      if (profitabilityError !== null) toast.dismiss("profitability-error")
    }
  }, [profitabilityError])

  return (
    <div className='w-full h-full flex flex-col gap-2 flex-grow'>
      <MapToolbarAdmin />
      <div ref={ref} className='w-full h-full max-h-[calc(100vh-260px)] flex-grow bg-muted border rounded-xl'>
        <MapStage
          mapData={mapData}
          actions={<MapItemsActionsAdmin />}
          className='w-full'
        >
          <MapItemsAdmin data={data} profitability={profitability} />
        </MapStage>
      </div>
    </div>
  )
}
