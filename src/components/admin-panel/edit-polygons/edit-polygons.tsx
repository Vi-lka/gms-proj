"use client"

import React from 'react';
import useElementDimensions from '~/hooks/use-ellement-dimensions';
import { cn } from '~/lib/utils';
import dynamic from 'next/dynamic';
import { usePolyStore } from '~/components/poly-annotation/store/poly-store-provider';
import TooltipMouse from '~/components/ui/special/tooltip-mouse';
import EditPolygonsActions from './actions/edit-polygons-actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import SelectField from './toolbar/select-field';
import Image from 'next/image';
import { env } from '~/env';

const CanvasStage = dynamic(() => import('~/components/poly-annotation/canvas-stage'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});
const PolyItemsEdit = dynamic(() => import('~/components/poly-annotation/poly-items-edit'), {
  ssr: false,
});
const Toolbar = dynamic(() => import('./toolbar/toolbar'), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

export default function EditPolygons({ className }: { className?: string }) {
  const { dimensions, ref } = useElementDimensions();

  const tooltip = usePolyStore((state) => state.tooltip)
  const fieldId = usePolyStore((state) => state.fieldId)
  const setStageConfig = usePolyStore((state) => state.setStageConfig)

  const [imageUrl, setImageUrl] = React.useState<string>()
  
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

  return (
    <div className={cn("relative flex flex-col gap-2 flex-grow w-full h-full", className)}>
      <SelectField searchParams={{ hasFieldMap: false }} />
      <Toolbar 
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        showControls={fieldId !== null && imageUrl !== undefined} 
      />
      <TooltipMouse open={!!tooltip} description={tooltip ?? ''} className='flex flex-col w-full h-full flex-grow'>
        <div ref={ref} className='block w-full h-full flex-grow'>
          <Content 
            fieldId={fieldId} 
            imageUrl={imageUrl} 
            setImageUrl={setImageUrl}
          />
        </div>
      </TooltipMouse>
    </div>
  )
}

function Content({
  fieldId,
  imageUrl,
  setImageUrl
}: {
  fieldId: string | null,
  imageUrl: string | undefined,
  setImageUrl: React.Dispatch<React.SetStateAction<string | undefined>>
}) {

  if (fieldId === null) return null

  if (imageUrl === undefined) return (
    <div className='w-full h-full flex items-center justify-center'>
      <Card>
        <CardHeader>
          <CardTitle>Загрузите фото</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Тестовый сервер. Загрузка файлов невозможна, будет загружено тестовое фото</p>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <Button
            onClick={() => setImageUrl('/images/test.svg')}
          >
            Загрузить
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
  
  return (
    <CanvasStage
      imageUrl={imageUrl} 
      className="h-full max-h-[calc(100vh-260px)]"
      actions={<EditPolygonsActions />} 
    >
      <PolyItemsEdit />
    </CanvasStage>
  )
}
