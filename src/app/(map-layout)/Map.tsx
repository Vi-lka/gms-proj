"use client"

import React from 'react'
import { type getMapItems } from '~/server/queries/map'
import { type getMap } from '~/server/queries/map-svg'
import dynamic from 'next/dynamic';
import useElementDimensions from '~/hooks/use-ellement-dimensions'
import { useSetAtom } from 'jotai'
import { mapContainerDimensions } from '~/lib/atoms/main'
import MapItemsFilters from '~/components/map/filters/map-items-filters'
import MapItemDrawer from '~/components/map/map-item-info/map-item-drawer'
import { type getProfitability } from '~/server/queries/profitability'
import { toast } from 'sonner'
import MapOpenTable from '~/components/map/map-open-table';
import { errorToast } from '~/components/ui/special/error-toast';

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
  const [
    { data, error }, 
    { data: mapData, error: mapDataError }, 
    { data: profitability, error: profitabilityError }
  ] = React.use(promises)

  const { dimensions, ref } = useElementDimensions();
  const setContainerDimensions = useSetAtom(mapContainerDimensions)

  React.useEffect(() => {
    if (dimensions) setContainerDimensions(dimensions)
  }, [dimensions, setContainerDimensions])

  React.useEffect(() => {
    if (error !== null) errorToast(error, { id: "data-error" })
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  React.useEffect(() => {
    if (mapDataError !== null) errorToast(mapDataError, { id: "map-data-error" })
    return () => { 
      if (mapDataError !== null) toast.dismiss("map-data-error")
    }
  }, [mapDataError])

  React.useEffect(() => {
    if (profitabilityError !== null) errorToast(profitabilityError, { id: "profitability-error" })
    return () => { 
      if (profitabilityError !== null) toast.dismiss("profitability-error")
    }
  }, [profitabilityError])

  return (
    <div className='w-full h-full flex flex-col gap-2 flex-grow'>
      <div ref={ref} className='w-full h-full flex-grow bg-muted'>
        <MapItemDrawer />
        <MapStage
          mapData={mapData}
          actions={
            <>
              <MapItemsFilters />
              <MapOpenTable />
            </>
          }
          className='w-full'
        >
          <MapItems data={data} profitability={profitability} />
        </MapStage>
      </div>
    </div>
  )
}
