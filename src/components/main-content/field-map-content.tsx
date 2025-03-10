"use client"

import dynamic from 'next/dynamic';
import React from 'react'
import DefaultLoading from '~/components/loadings/default';
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider';
import { type Polygon } from '~/components/poly-annotation/types';
import TooltipMouse from '~/components/ui/special/tooltip-mouse'
import useElementDimensions from '~/hooks/use-ellement-dimensions';
import { splitIntoPairs } from '~/lib/utils';
import { type getFieldMapWithImage } from '~/server/queries/fields-maps';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const CanvasStage = dynamic(() => import('~/components/poly-annotation/canvas-stage'), {
  ssr: false,
  loading: () => <DefaultLoading className="flex-grow" />,
});
const PolyItems = dynamic(() => import('~/components/poly-annotation/poly-items'), {
  ssr: false,
});

type ReturnDataT = Awaited<ReturnType<typeof getFieldMapWithImage>>

interface FieldMapContentProps {
  data: NonNullable<ReturnDataT["data"]>
}

export default function FieldMapContent({
  data
}: FieldMapContentProps) {
  const setGlobalState = usePolyStore((state) => state.setGlobalState)
  const { pause, resume } = useTemporalStore((state) => state)

  React.useEffect(() => {
    const dataForState = {
      fieldId: data.fieldId,
      imageUrl: data.fileUrl,
      polygons: data.polygons.map((polygon) => {
        const points = splitIntoPairs(polygon.points)
        return {
          id: polygon.id,
          points,
          flattenedPoints: polygon.points,
          isFinished: true,
          licensedArea: {
            id: polygon.area.id,
            name: polygon.area.name,
          }
        }
      })
    }
    pause();
    setGlobalState((prev) => ({
      ...prev,
      ...dataForState
    }));
    resume();
  }, [data, pause, resume, setGlobalState])

  return (
    <Content imageUrl={data.fileUrl} />
  )
}

function Content({
  imageUrl
}: {
  imageUrl: string
}) {
  const router = useRouter();

  const { dimensions, ref } = useElementDimensions();

  const tooltip = usePolyStore((state) => state.tooltip)
  const setStageConfig = usePolyStore((state) => state.setStageConfig)
  
  React.useEffect(() => {
    if (dimensions) {
      const {width, height} = dimensions
      setStageConfig((prev) => ({
        ...prev,
        width,
        height,
      }))
    }
  }, [dimensions, setStageConfig])

  const onPolygonHover = (polygon: Polygon) => {
    if (polygon.licensedArea !== null) router.prefetch(`/areas/${polygon.licensedArea.id}`)
  }

  const onPolygonClick = (polygon: Polygon) => {
    if (polygon.licensedArea !== null) router.push(`/areas/${polygon.licensedArea.id}`)
    else toast.error('Нет Лицензионного участка')
  }

  return (
    <TooltipMouse 
      open={!!tooltip} 
      description={tooltip ?? ''} 
      className='flex flex-col w-full h-full flex-grow min-h-[calc(100vh-280px)]'
    >
      <div ref={ref} className='flex w-full h-full flex-grow'>
        <CanvasStage
          imageUrl={imageUrl} 
          className="h-full dark:bg-background/20 bg-primary/10 shadow-inner border border-foreground/20"
        >
          <PolyItems 
            onPolygonClick={onPolygonClick}
            onPolygonHover={onPolygonHover}
          />
        </CanvasStage>
      </div>
    </TooltipMouse>
  )
}
