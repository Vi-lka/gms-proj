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
import { cn, formatApproxNumber, idToSentenceCase } from '~/lib/utils'
import { Separator } from '~/components/ui/separator'
import useOutsideClick from '~/hooks/use-outside-click'
import { Badge } from '~/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { useMapItemsSearch } from '../filters/hooks'
import { ScrollArea } from '~/components/ui/scroll-area'

export default function SingleItem({
  data,
  onClick,
  handleClickOutside,
  className,
  htmlClassName
}: {
  data: MapItemT,
  onClick?: React.MouseEventHandler<HTMLDivElement>,
  handleClickOutside?: () => void,
  className?: string,
  htmlClassName?: string,
}) {
  const stage = useAtomValue(stageAtom)
  const selectedItem = useAtomValue(selectedItemAtom)
  const { width: windowW } = useAtomValue(mapContainerDimensions);

  const ref = useOutsideClick(100, handleClickOutside);
  const [{elements: elementsComparison, elementsView}] = useMapItemsSearch()

  const { width, height, x, y } = data

  const { pos } = useStageEllementPos(
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
        // width: size.width,
        // height: size.height,
        x: pos.x,
        y: pos.y,
        scale: {x: scale, y: scale}
      }}
      divProps={{
        className: cn("hover:!z-[120]", htmlClassName)
      }}
    >
      <div className='relative' style={{scale: ellementScale}}>
        <div 
          ref={ref}
          className={cn(
            buttonVariants({ 
              variant: "default", 
              size: "default", 
              className: "absolute -translate-x-1/2 -translate-y-1/2 block p-0.5 w-fit h-fit aspect-square text-center rounded-full group bg-foreground dark:bg-background text-background dark:text-foreground dark:hover:bg-accent hover:bg-foreground"
            }),
            className
          )}
          onClick={onClick}
        >
          <CircleDot className='mx-auto !w-5 !h-5 group-hover:text-primary transition-all' />
          <div className='relative font-medium text-xs text-left cursor-pointer'>
            <div className='absolute top-[-54px] -left-0.5 flex gap-1 items-end mb-1 transition-all duration-300'>
              <TooltipProvider delayDuration={150}>
                {data.maxElements.filtered.map((value, index) => {

                  const inSearch = 
                  elementsView?.some(element => element === value.key)
                  ??
                  elementsComparison?.some(item => item.element === value.key)

                  return (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <Badge 
                          className={cn(
                            'relative p-0 px-0.5 h-fit rounded-sm shadow text-background transition-all duration-300',
                            (inSearch && selectedItem?.id !== data.id) && "transition-none outline-dashed outline-2 outline-yellow"
                          )}
                          style={{
                            fontSize: 12 - index*1.1,
                            lineHeight: 2,
                            borderColor: `hsl(var(--border) / ${1 - index*0.25})`,
                            backgroundColor: `hsl(var(--foreground) / ${1 - index*0.15})`,
                          }}
                        >
                          {idToSentenceCase(value.key)}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {formatApproxNumber(value.originalValue, value.approxValue)}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </TooltipProvider>
            </div>
            <div className={cn(
              'absolute whitespace-pre top-[-21px] block w-max max-w-36 text-wrap break-words text-foreground bg-accent border shadow-md p-1 rounded-md transition-all duration-300',
              selectedItem?.id === data.id ? "left-7" : "left-6"
            )}>
              {data.cluster 
                ? (
                  <ScrollArea classNameViewport='max-h-24 pr-1' classNameBar='border-l-none w-1 p-[0.5px] bg-foreground/10 rounded-full'>
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
                  </ScrollArea>
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
