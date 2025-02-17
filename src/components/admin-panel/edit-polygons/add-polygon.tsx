"use client"

import { type KonvaEventObject } from 'konva/lib/Node';
import { Check, Database, MapIcon, MapPinCheck, Plus, X } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider';
import useRelatedRatio from '~/components/poly-annotation/store/useRelatedRatio';
import { getMousePos } from '~/components/poly-annotation/utils';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import AddPolygonSheet from './add-polygon-sheet';

export default function AddPolygon({
  disabled,
  className
}: {
  disabled?: boolean,
  className?: string
}) {
  const fieldId = usePolyStore((state) => state.fieldId)
  const stageRef = usePolyStore((state) => state.stageRef)
  const imagePos = usePolyStore((state) => state.imageConfig.pos)
  const polygons = usePolyStore((state) => state.polygons)
  const activePolygonIndex = usePolyStore((state) => state.activePolygonIndex)
  const isMouseOverPoint = usePolyStore((state) => state.isMouseOverPoint)
  const isAddible = usePolyStore((state) => state.isAddible)
  const askAcceptPos = usePolyStore((state) => state.askAcceptPos)
  const openSheet = usePolyStore((state) => state.openSheet)
  const editPolygonIndex = usePolyStore((state) => state.editPolygonIndex)
  const setPolygons = usePolyStore((state) => state.setPolygons)
  const deletePolygon = usePolyStore((state) => state.deletePolygon)
  const setActivePolygonIndex = usePolyStore((state) => state.setActivePolygonIndex)
  const setIsMouseOverPoint = usePolyStore((state) => state.setIsMouseOverPoint)
  const setIsAddible = usePolyStore((state) => state.setIsAddible)
  const setAskAcceptPos = usePolyStore((state) => state.setAskAcceptPos)
  const setOpenSheet = usePolyStore((state) => state.setOpenSheet)
  const setGlobalState = usePolyStore((state) => state.setGlobalState)

  const { pause, resume } = useTemporalStore((state) => state)

  const relatedRatio = useRelatedRatio();

  const handleStartAddingPolygon = () => {
    setIsAddible(true)
    pause();
    setPolygons((prev) => [
      ...prev,
      {
        id: uuidv4(),
        points: [],
        flattenedPoints: [],
        isFinished: false,
        licensedArea: null,
      }
    ])
    setActivePolygonIndex(polygons.length)
    resume()
  }

  const handleMouseClick = React.useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const activeKey = activePolygonIndex;
      const copy = [...polygons];

      let polygon = copy[activeKey];

      // prevent adding new polygon
      if (!polygon || !isAddible || askAcceptPos) return;
      // prevent adding new point on vertex if it is not mouse over
      if (e.target.name() === 'vertex' && !isMouseOverPoint) return;

      if (polygon.isFinished) {
        setIsMouseOverPoint(false);
      }
      const { points } = polygon;
      const stage = e.target.getStage();
      const mousePos = getMousePos(stage);
      const relativeToImageMousePos = [
        ((mousePos[0]!) - imagePos.x)*(1/relatedRatio),
        ((mousePos[1]!) - imagePos.y)*(1/relatedRatio),
      ]

      if (isMouseOverPoint && points.length >= 3) {
        polygon = {
          ...polygon,
          isFinished: true,
        };
        // setAskAcceptPos(true)
        copy[activeKey] = polygon;
        setGlobalState((prev) => ({
          ...prev,
          polygons: copy,
          askAcceptPos: true
        }))
      } else {
        polygon = {
          ...polygon,
          points: [...points, relativeToImageMousePos],
        };
        copy[activeKey] = polygon;
        setPolygons(copy)  
      }
    },
    [
      isAddible, 
      askAcceptPos,
      activePolygonIndex, 
      polygons, 
      isMouseOverPoint, 
      imagePos.x, 
      imagePos.y, 
      relatedRatio, 
      setPolygons, 
      setIsMouseOverPoint, 
      setGlobalState
    ],
  );

  const handleMouseMove = React.useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const mousePos = getMousePos(stage);
      const relativeToImageMousePos = [
        ((mousePos[0]!) - imagePos.x)*(1/relatedRatio),
        ((mousePos[1]!) - imagePos.y)*(1/relatedRatio),
      ]
      // // set flattened points for active polygon
      const copy = [...polygons];
      let polygon = copy[activePolygonIndex];

      // prevent moving new polygon
      if (!stage || !isAddible || askAcceptPos) return;
      if (!polygon || polygon.isFinished) return;

      const _flattenedPoints = polygon.points.concat(relativeToImageMousePos).reduce((a, b) => a.concat(b), []);
      polygon = {
        ...polygon,
        flattenedPoints: _flattenedPoints,
      };
      copy[activePolygonIndex] = polygon;
      pause();
      setPolygons(copy);
      resume();
    },
    [
      isAddible, 
      imagePos.x, 
      imagePos.y, 
      relatedRatio, 
      polygons, 
      activePolygonIndex, 
      askAcceptPos,
      setPolygons, 
      pause, 
      resume
    ],
  );

  // Effect for Add and Drag new polygon
  React.useEffect(() => {
    stageRef?.on('click', handleMouseClick);
    stageRef?.on('mousemove', handleMouseMove);

    return () => {
      stageRef?.removeEventListener('click');
      stageRef?.removeEventListener('mousemove');
    }
  }, [handleMouseClick, handleMouseMove, stageRef])

  const onDismiss = React.useCallback(() => {
    deletePolygon(activePolygonIndex);
    setAskAcceptPos(false)
    setIsAddible(false)
    // toast.dismiss("accept-polygon-pos")
  }, [activePolygonIndex, deletePolygon, setIsAddible, setAskAcceptPos])

  const onAccept = React.useCallback(() => {
    pause()
    setOpenSheet(true)
    setAskAcceptPos(false)
    // toast.dismiss("accept-polygon-pos")
    resume()
  }, [pause, resume, setAskAcceptPos, setOpenSheet])

  // Effect for accept item Position and open Sheet for data input
  React.useEffect(() => {
    if (askAcceptPos) {
      toast('Подтвердите расположение полигона', {
        id: "accept-polygon-pos",
        description: "Вы можете перетаскивать полигон и его края",
        duration: Infinity,
        position: "bottom-center",
        action: {
          label: <Check className="size-4" />,
          onClick: onAccept,
        },
        cancel: {
          label: <X className="size-4" />,
          onClick: onDismiss,
        },
        onDismiss
      });
    } else {
      toast.dismiss("accept-polygon-pos")
    }
  }, [askAcceptPos, onAccept, onDismiss])

  function getButtonContent() {
    if (askAcceptPos) return {
      title: "Подтвердите расположение элемента...",
      icon: <MapPinCheck className="size-4 flex-none" aria-hidden="true" />,
    }
    if (openSheet) return { 
      title:"Введите данные", 
      icon: <Database className="size-4 flex-none" aria-hidden="true" />
    };
    if (isAddible) return { 
      title: "Кликнете в нужном месте на карте...", 
      icon: <MapIcon className="size-4 flex-none" aria-hidden="true" /> 
    }
    return {
      title: "Добавить полигон",
      icon: <Plus className="size-4 flex-none" aria-hidden="true" />
    }
  }

  // Effect for "askAcceptPos" buttons events
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (askAcceptPos && !openSheet) {
        if (event.key === "Escape") {
          event.preventDefault()
          onDismiss()
        }
        if (event.key === "Enter") {
          event.preventDefault()
          onAccept()
        }  
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  })

  const onOpenChange = React.useCallback((open: boolean) => {
    setOpenSheet(open)
    if (!open) {
      pause()
      setAskAcceptPos(true)
      resume()
    }
  }, [pause, resume, setAskAcceptPos, setOpenSheet])
  
  return (
    <>
      <Button
        aria-label="Добавить полигон"
        variant="ghost"
        disabled={!!disabled || isAddible || askAcceptPos || openSheet || editPolygonIndex !== null}
        className={cn("h-8 px-2 lg:px-3", className)}
        onClick={handleStartAddingPolygon}
      >
        {getButtonContent().title}
        {getButtonContent().icon}
      </Button>
      <AddPolygonSheet
        open={openSheet}
        onOpenChange={onOpenChange}
        searchParams={{
          fieldId: fieldId ?? undefined,
        }}
      />
    </>
  )
}
