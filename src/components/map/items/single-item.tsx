"use client"

import React from 'react'
import { Html } from 'react-konva-utils'
import { useAtomValue } from 'jotai'
import { CircleDot } from 'lucide-react'
import { type MapItemT } from '~/lib/types'
import { mapContainerDimensions, selectedItemAtom, stageAtom } from '~/lib/atoms/main'
import { useStageEllementPos } from '~/hooks/use-stage-ellement-pos'
import valueFromWindowWidth from '~/lib/intersections/valueFromWindowWidth'
import { buttonVariants } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import { Separator } from '~/components/ui/separator'
import useOutsideClick from '~/hooks/use-outside-click'

export default function SingleItem({
  data,
  onClick,
  handleClickOutside,
  className
}: {
  data: MapItemT,
  onClick?: React.MouseEventHandler<HTMLDivElement>,
  handleClickOutside?: () => void,
  className?: string
}) {
  const stage = useAtomValue(stageAtom)

  const selectedItem = useAtomValue(selectedItemAtom)

  const ref = useOutsideClick(100, handleClickOutside);

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

  const ellementScale = valueFromWindowWidth({
    windowW,
    w1024: 0.8,
    w425: 0.6,
    minw: 0.3,
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
      divProps={{
        className: "hover:!z-[1000]"
      }}
    >
      <div className='relative' style={{scale: size.width < 1 ? size.width : ellementScale}}>
        <div 
          ref={ref}
          className={cn(
            buttonVariants({ 
              variant: "default", 
              size: "default", 
              className: "absolute -translate-x-1/2 -translate-y-1/2 block p-0.5 w-fit h-fit aspect-square text-center rounded-full group hover:bg-accent duration-300"
            }),
            className
          )}
          onClick={onClick}
        >
          <CircleDot className='mx-auto !w-5 !h-5 group-hover:text-foreground' />
          <div className='relative font-medium text-xs text-left cursor-pointer'>
            <div className={cn(
              'absolute whitespace-pre top-[-21px] block w-max max-w-32 text-wrap break-words text-foreground bg-accent border shadow-md p-1 rounded-md transition-all duration-300',
              selectedItem?.id === data.id ? "left-7" : "left-6"
            )}>
              {data.cluster 
                ? (
                  <div className='flex flex-col gap-1'>
                    <p className='text-foreground/70 text-[10px] line-clamp-2'>{data.cluster.name}</p>
                    {data.companies.map((comp, indx) => (
                      <div key={indx}>
                        <span className='line-clamp-2'>
                          {comp.name}
                        </span>
                        {indx < data.companies.length - 1 && (
                          <Separator className='bg-foreground mt-0.5' />
                        )}
                      </div>
                    ))}
                  </div>
                )
                : (
                  <p className='line-clamp-2'>
                    {data.companies[0]?.name}
                  </p>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </Html>
  )
}
