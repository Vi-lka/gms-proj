"use client"

import dynamic from 'next/dynamic';
import React from 'react'
import DefaultLoading from '~/components/loadings/default';
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider';
import { type Polygon } from '~/components/poly-annotation/types';
import TooltipMouse from '~/components/ui/special/tooltip-mouse'
import useElementDimensions from '~/hooks/use-ellement-dimensions';
import { cn, splitIntoPairs } from '~/lib/utils';
import { type getFieldMapWithImage } from '~/server/queries/fields-maps';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ScrollArea } from '../ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { List } from 'lucide-react';

const CanvasStage = dynamic(() => import('~/components/poly-annotation/canvas-stage'), {
  ssr: false,
  loading: () => <DefaultLoading className="flex-grow" />,
});
const PolyItems = dynamic(() => import('~/components/poly-annotation/poly-items'), {
  ssr: false,
});

type ReturnDataT = Awaited<ReturnType<typeof getFieldMapWithImage>>

interface FieldMapContentProps {
  data: NonNullable<ReturnDataT["data"]>,
  className?: string
}

export default function FieldMapContent({
  data,
  className
}: FieldMapContentProps) {
  const setGlobalState = usePolyStore((state) => state.setGlobalState)
  const { pause, resume } = useTemporalStore((state) => state)

  const polygons = React.useMemo(() => {
    return data.polygons.map((polygon) => {
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
    }).sort((a, b) => a.licensedArea.name.localeCompare(b.licensedArea.name))

  }, [data.polygons])

  React.useEffect(() => {
    const dataForState = {
      fieldId: data.fieldId,
      imageUrl: data.fileUrl,
      polygons,
    }
    pause();
    setGlobalState((prev) => ({
      ...prev,
      ...dataForState
    }));
    resume();
  }, [data, polygons, pause, resume, setGlobalState])

  return (
    <div className={cn('flex gap-6 relative', className)}>
      <FieldMap imageUrl={data.fileUrl} className='lg:w-3/4 md:w-2/3 w-full md:min-h-[calc(100vh-250px)] min-h-[calc(100vh-280px)]' />

      <FieldList polygons={polygons} className='lg:w-1/4 md:w-1/3 md:block hidden md:min-h-[calc(100vh-250px)]' />
      <Popover>
        <PopoverTrigger asChild className='md:hidden block'>
          <Button variant="outline" className='md:hidden block absolute right-2 top-2 w-fit h-fit p-2 dark:border-primary/20 shadow rounded-full z-50'>
            <List />
          </Button>
        </PopoverTrigger>
        <PopoverContent align='start' side='left' className='md:hidden block min-[425px]:w-72 min-[320px]:w-60 p-0 border-none rounded-xl shadow-md'>
          <FieldList polygons={polygons} className='w-full' />
        </PopoverContent>
      </Popover>
    </div>
  )
}

function FieldMap({
  imageUrl,
  className
}: {
  imageUrl: string,
  className?: string
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
      className={cn('flex flex-col w-full h-full flex-grow', className)}
    >
      <div ref={ref} className='flex w-full h-full flex-grow'>
        <CanvasStage
          imageUrl={imageUrl}
          className="h-full dark:bg-background/50 shadow-inner border border-foreground/10"
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

function FieldList({
  polygons,
  className
}: {
  polygons: Polygon[];
  className?: string
}) {
  const setHoverPolygonIndex = usePolyStore((state) => state.setHoverPolygonIndex)

  const licensedAreas = polygons
    .map(polygon => polygon.licensedArea)
    .filter((area) => area !== null)

  return (
    <Card className={cn("flex-grow h-full dark:bg-background/50 shadow-md border border-foreground/10", className)}>
      <CardHeader className="p-0">
        <CardContent className="p-0">
          <CardTitle className='md:p-6 p-3 text-center md:text-base text-sm'>Лицензионные участки</CardTitle>
          <Separator className='bg-foreground/10' />
        </CardContent>
      </CardHeader>
      <ScrollArea classNameViewport='max-h-[calc(100vh-345px)] [&>div]:!block'>
        <CardContent className="p-0">
          {licensedAreas.map((area, indx) => (
            <div key={area.id}>
              <Link key={area.id} href={`/areas/${area.id}`} passHref className='w-full h-fit'>
                <Button 
                  variant="ghost" 
                  className='w-full h-full whitespace-normal text-left md:py-8 md:px-6 py-4 px-3 justify-start text-sm rounded-none transition-all'
                  onMouseOver={() => setHoverPolygonIndex(indx)}
                  onMouseOut={() => setHoverPolygonIndex(null)}
                >
                  {area.name}
                </Button>
              </Link>
              {indx < licensedAreas.length - 1 && <Separator key={`sep-${area.id}`} className='bg-foreground/10' />}
            </div>
          ))}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}