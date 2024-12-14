"use client"

import React from 'react'
import { Html } from 'react-konva-utils'
import { useAtomValue } from 'jotai'
import { CircleDot } from 'lucide-react'
import { type MapItemT } from '~/lib/types'
import { mapContainerDimensions, stageAtom } from '~/lib/atoms/main'
import { useStageEllementPos } from '~/hooks/use-stage-ellement-pos'
import valueFromWindowWidth from '~/lib/intersections/valueFromWindowWidth'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

export default function SingleItem({
  data,
  onClick,
  className
}: {
  data: MapItemT,
  onClick?: React.MouseEventHandler<HTMLButtonElement>,
  className?: string
}) {
  const stage = useAtomValue(stageAtom)

  const { width: windowW } = useAtomValue(mapContainerDimensions);

  const { width, height, x, y } = data

  const {size, pos} = useStageEllementPos(
    {width, height},
    {x, y}
  )

  const scale = valueFromWindowWidth({
    windowW,
    w1024: 1.2/stage.scale,
    w425: 1.8/stage.scale,
    minw: 2.4/stage.scale,
  })

  return (
    <Html
      groupProps={{
        width: size.width,
        height: size.height,
        x: pos.x,
        y: pos.y,
        scale: {x: scale, y: scale}
      }}
    >
      <div className='relative' style={{scale: size.width < 1 ? size.width : 1}}>
        <Button 
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 block p-0.5 w-fit h-fit aspect-square text-center rounded-full group hover:bg-accent duration-300",
            className
          )}
          onClick={onClick}
        >
          <CircleDot className='mx-auto !w-5 !h-5 group-hover:text-foreground' />
          <p className='relative font-semibold text-xs'>
            <span className='absolute whitespace-pre top-[-17px] left-7 text-foreground bg-accent group-hover:underline rounded-md'>{data.companies[0]?.name}</span>
          </p>
        </Button>
      </div>
    </Html>
  )
}
