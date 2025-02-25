"use client"

import React from 'react';
import useElementDimensions from '~/hooks/use-ellement-dimensions';
import { cn } from '~/lib/utils';
import dynamic from 'next/dynamic';
import { usePolyStore } from '~/components/poly-annotation/store/poly-store-provider';
import TooltipMouse from '~/components/ui/special/tooltip-mouse';
import EditPolygonsActions from './actions/edit-polygons-actions';
import SelectField from './toolbar/select-field';
import UploadFile from './upload-file';
import SaveButton from './toolbar/save-button';
import UpdateButton from './toolbar/update-button';
import { type DefaultEditDataT } from '~/components/poly-annotation/types';

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

type EditPolygonsConditionalProps =
  | {
      type: "create",
    }
  | {
      type: "update",
      defaultData: DefaultEditDataT | undefined,
    };

type EditPolygonsProps = EditPolygonsConditionalProps & {
  className?: string
}

export default function EditPolygons(props: EditPolygonsProps) {
  const { dimensions, ref } = useElementDimensions();

  const tooltip = usePolyStore((state) => state.tooltip)
  const fieldId = usePolyStore((state) => state.fieldId)
  const imageUrl = usePolyStore((state) => state.imageUrl)
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

  const title = (props.type === "update" && props.defaultData)
    ? `${props.defaultData.fieldName} (${props.defaultData.companyName})`
    : null

  return (
    <div className={cn("relative flex flex-col gap-2 flex-grow w-full h-full", props.className)}>
      {props.type === "update" 
        ? <p className='w-full truncate'>{title}</p>
        : <SelectField searchParams={{ hasFieldMap: false }} />
      }
      <Toolbar showControls={fieldId !== null && imageUrl !== undefined}>
        {props.type === "create" && <SaveButton />}
        {props.type === "update" && <UpdateButton defaultData={props.defaultData} />}
      </Toolbar>
      <TooltipMouse open={!!tooltip} description={tooltip ?? ''} className='flex flex-col w-full h-full flex-grow'>
        <div ref={ref} className='block w-full h-full flex-grow'>
          <Content fieldId={fieldId} imageUrl={imageUrl} />
        </div>
      </TooltipMouse>
    </div>
  )
}

function Content({
  fieldId,
  imageUrl,
}: {
  fieldId: string | null,
  imageUrl: string | undefined,
}) {

  if (fieldId === null) return null

  if (imageUrl === undefined) return (
    <div className='w-full h-full flex items-center justify-center'>
      <UploadFile />
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
