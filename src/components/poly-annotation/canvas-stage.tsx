import Konva from 'konva'
import React from 'react'
import { Layer, Stage } from 'react-konva';
import valueFromWindowWidth from '~/lib/intersections/valueFromWindowWidth';
import type { KonvaEventObject } from 'konva/lib/Node';
import { cn } from '~/lib/utils';
import PolyImage from './poly-image';
import { usePolyStore } from './store/poly-store-provider';

export default function CanvasStage({
  imageUrl,
  children,
  actions,
  draggable = true,
  className,
  handleMouseClick,
  handleMouseMove,
}: {
  imageUrl: string,
  children?: React.ReactNode,
  actions?: React.ReactNode,
  draggable?: boolean,
  className?: string,
  handleMouseClick?: (e: KonvaEventObject<MouseEvent>) => void,
  handleMouseMove?: (e: KonvaEventObject<MouseEvent>) => void
}) {
  Konva.hitOnDragEnabled = true

  const ref = React.useRef<Konva.Stage>(null);

  const stageConfig = usePolyStore((state) => state.stageConfig)
  const setStage = usePolyStore((state) => state.setStageConfig)
  const setStageRef = usePolyStore((state) => state.setStageRef)

  React.useEffect(() => {
    if (ref.current) setStageRef(ref.current)
  }, [ref, setStageRef])

  const MIN_SCALE = valueFromWindowWidth({
    windowW: stageConfig.width,
    w1024: 0.9,
    w425: 0.9,
    minw: 1,
  })
  const MAX_SCALE = valueFromWindowWidth({
    windowW: stageConfig.width,
    w1024: 2,
    w425: 2.5,
    minw: 3,
  })

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    if (!draggable) return;

    const scaleBy = stageConfig.width > 1024 ? 1.6 : 1.4;
    
    const eventStage = e.target.getStage();
    if (eventStage) {
      const oldScale = eventStage.scaleX();
      const mousePoint = eventStage.getPointerPosition() ?? {x: 0, y: 0};
      const mousePointTo = {
        x: (mousePoint.x - eventStage.x()) / oldScale,
        y: (mousePoint.y - eventStage.y()) / oldScale
      };

      const newScale = e.evt.deltaY < 0 
        ? oldScale * scaleBy 
        : oldScale / scaleBy;

      let boundedScale = newScale;
      if (newScale < MIN_SCALE) boundedScale = MIN_SCALE;
      if (newScale > MAX_SCALE) boundedScale = MAX_SCALE;

      const x = boundedScale >= MIN_SCALE 
        ? mousePoint.x - mousePointTo.x * boundedScale 
        : (stageConfig.width*(1-MIN_SCALE))/2;

      const y = boundedScale >= MIN_SCALE 
        ? mousePoint.y - mousePointTo.y * boundedScale 
        : (stageConfig.width*(1-MIN_SCALE))/2

      eventStage.to({
        width: eventStage.width(),
        height: eventStage.height(),
        scaleX: boundedScale,
        scaleY: boundedScale,
        x,
        y,
        onFinish: () => {
          setStage({
            width: eventStage.width(),
            height: eventStage.height(),
            scale: boundedScale,
            x,
            y
          });
        },
        duration: 0.3
      })
    }
  };

  // function handleDragBound(this: KonvaNode<KonvaNodeConfig>, pos: Konva.Vector2d): Konva.Vector2d {
  //   const leftBound = (-stageConfig.width * (MIN_SCALE - stageConfig.scale))/(stageConfig.scale*2)
  //   const rightBound = Math.max(pos.x, stageConfig.width * (MIN_SCALE - stageConfig.scale))

  //   const topBound = (-stageConfig.height * (MIN_SCALE - stageConfig.scale))/(stageConfig.scale*2)
  //   const bottomBound = Math.max(pos.y, stageConfig.height * (MIN_SCALE - stageConfig.scale))

  //   const x = Math.min(leftBound, rightBound);
  //   const y = Math.min(topBound, bottomBound);

  //   if (stageConfig.scale <= MIN_SCALE) return ({ 
  //     x: (stageConfig.width*(1-MIN_SCALE))/2, 
  //     y: (stageConfig.height*(1-MIN_SCALE))/2
  //   })
  //   else return { x, y };
  // }

  function getDistance(p1: { x: number, y: number }, p2: { x: number, y: number }) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  function getCenter(p1: { x: number, y: number }, p2: { x: number, y: number }) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  let lastCenter: { x: number, y: number } | null = null;
  let lastDist = 0;
  let dragStopped = false;

  const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault();

    if (!draggable) return;

    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    const eventStage = e.target.getStage();

    if (eventStage) {
      // we need to restore dragging, if it was cancelled by multi-touch
      if (touch1 && !touch2 && !eventStage.isDragging() && dragStopped) {
        eventStage.startDrag();
        dragStopped = false;
      }

      if (touch1 && touch2) {
        // if the stage was under Konva's drag&drop
        // we need to stop it, and implement our own pan logic with two pointers
        if (eventStage.isDragging()) {
          dragStopped = true;
          eventStage.stopDrag();
        }
  
        const p1 = {
          x: touch1.clientX,
          y: touch1.clientY,
        };
        const p2 = {
          x: touch2.clientX,
          y: touch2.clientY,
        };
  
        if (!lastCenter) {
          lastCenter = getCenter(p1, p2);
          return;
        }
        const newCenter = getCenter(p1, p2);
  
        const dist = getDistance(p1, p2);
  
        if (!lastDist) {
          lastDist = dist;
        }
  
        // local coordinates of center point
        const pointTo = {
          x: (newCenter.x - eventStage.x()) / eventStage.scaleX(),
          y: (newCenter.y - eventStage.y()) / eventStage.scaleX(),
        };
  
        const newScale = eventStage.scaleX() * (dist / lastDist);

        let boundedScale = newScale;
        if (newScale < MIN_SCALE) boundedScale = MIN_SCALE;
        if (newScale > MAX_SCALE) boundedScale = MAX_SCALE;
  
        // calculate new position of the stage
        const dx = newCenter.x - lastCenter.x;
        const dy = newCenter.y - lastCenter.y;

        const newPos = {
          x: newCenter.x - pointTo.x * boundedScale + dx,
          y: newCenter.y - pointTo.y * boundedScale + dy
        }

        eventStage.scaleX(boundedScale)
        eventStage.scaleY(boundedScale)
        eventStage.position(newPos)

        lastDist = dist;
        lastCenter = newCenter;
      }
    }
  }

  const handleTouchEnd = (e: KonvaEventObject<TouchEvent>) => {

    if (!draggable) return;

    lastDist = 0;
    lastCenter = null;

    const eventStage = e.target.getStage();

    if (eventStage) {
      setStage({
        width: eventStage.width(),
        height: eventStage.height(),
        scale: eventStage.scaleX(),
        x: eventStage.x(),
        y: eventStage.y(),
      });
    }
  }

  return (
    <>
      <Stage
        ref={ref}
        width={stageConfig.width}
        height={stageConfig.height}
        draggable={draggable}
        // dragBoundFunc={handleDragBound}
        onWheel={handleWheel}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseClick}
        onMouseMove={handleMouseMove}
        className={cn("block flex-grow bg-muted border rounded-xl overflow-hidden relative", className)}
      >
        <Layer>
          <PolyImage url={imageUrl} />
        </Layer>
        {children}
      </Stage>
      {actions}
    </>
  )
}
