"use client"

import { Button } from '~/components/ui/button'
import { useAtom, useAtomValue } from 'jotai'
import React, { useRef } from 'react'
import { Html } from 'react-konva-utils'
import { mapContainerDimensions, stageAtom, stageRefAtom } from '~/lib/atoms/main'
import { type IntersectionGroupT } from '~/lib/types'
import valueFromWindowWidth from '~/lib/intersections/valueFromWindowWidth'
import getGroupAverage from '~/lib/intersections/get-group-average'
import { useStageEllementPos } from '~/hooks/use-stage-ellement-pos'
import { cn } from '~/lib/utils'

export default function GroupItem({
  data,
  className
}: {
  data: IntersectionGroupT,
  className?: string,
}) {

  const ref = useRef<HTMLButtonElement>(null);

  const [stage, setStage] = useAtom(stageAtom);
  const stageRef = useAtomValue(stageRefAtom)

  const { width: windowW } = useAtomValue(mapContainerDimensions);

  const MIN_SCALE = valueFromWindowWidth({
    windowW,
    w1024: 0.9,
    w425: 0.9,
    minw: 1,
  })
  const MAX_SCALE = valueFromWindowWidth({
    windowW,
    w1024: 50,
    w425: 40,
    minw: 30,
  })

  const { width, height, x, y } = getGroupAverage(data.items)

  const { pos } = useStageEllementPos(
    {width, height},
    {x, y}
  )

  const handleScaleTo = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation()
    if (stageRef && ref.current) {
      const box = ref.current.getClientRects();

      const rectItem = box.item(0)

      if (rectItem) {
        const scaleBy = valueFromWindowWidth({
          windowW,
          w1024: Math.min(stageRef.width() / rectItem.width, stageRef.height() / rectItem.height) / 3,
          w425: Math.min(stageRef.width() / rectItem.width, stageRef.height() / rectItem.height) / 3.8,
          minw: Math.min(stageRef.width() / rectItem.width, stageRef.height() / rectItem.height) / 4.6
        })
        const oldScale = stageRef.scaleX(); 
        const newScale =  oldScale * scaleBy 

        // Do this because rectItem can be incorrect on large scale, and on mobile getPointerPosition() is zero before first interaction with stage
        const mousePoint = stageRef.getPointerPosition() ?? {x: rectItem.x, y: rectItem.y};

        const mousePointTo = {
          x: (mousePoint.x - stageRef.x()) / oldScale,
          y: (mousePoint.y - stageRef.y()) / oldScale
        };
  
        let boundedScale = newScale;
        if (newScale < MIN_SCALE) boundedScale = MIN_SCALE;
        if (newScale > MAX_SCALE) boundedScale = MAX_SCALE;
  
        const x = mousePoint.x - mousePointTo.x * boundedScale
        const y = mousePoint.y - mousePointTo.y * boundedScale
  
        const childrenScale = valueFromWindowWidth({
          windowW: width,
          w1024: 1.2/boundedScale,
          w425: 1.8/boundedScale,
          minw: 2.4/boundedScale,
        })
  
        stageRef.children.forEach(lr => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (lr.attrs.id !== "main-image") {
            lr.children.forEach(grp => {
              grp.to({
                scaleX: childrenScale,
                scaleY: childrenScale,
                duration: 0.3
              })
            })
          }
        })
  
        stageRef.to({
          width: stageRef.width(),
          height: stageRef.height(),
          scaleX: boundedScale,
          scaleY: boundedScale,
          x,
          y,
          onFinish: () => {
            setStage({
              width: stageRef.width(),
              height: stageRef.height(),
              scale: boundedScale,
              x,
              y
            });
          },
          duration: 0.3
        })
      }
    }
  }

  const scale = valueFromWindowWidth({
    windowW,
    w1024: 1.2/stage.scale,
    w425: 1.8/stage.scale,
    minw: 2.4/stage.scale,
  })

  const ellementScale = valueFromWindowWidth({
    windowW,
    w1024: 0.9,
    w425: 0.7,
    minw: 0.4,
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
    >
      <div className='relative' style={{scale: ellementScale}}>
        <Button
          ref={ref}
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2", 
            "p-3 aspect-square rounded-full",
            "ring-2 ring-primary ring-offset-1 ring-offset-accent",
            "hover:bg-accent hover:text-accent-foreground duration-300",
            className
          )}
          onClick={handleScaleTo}
        >
          {data.items.length}
        </Button>
      </div>
    </Html>
  )
}
