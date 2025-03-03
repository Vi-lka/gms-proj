"use client"

import React from 'react'
import { Check, Database, MapIcon, MapPinCheck, Plus, X } from 'lucide-react'
import { type MapItemSchema } from '~/lib/validations/forms'
import { useAtomValue } from 'jotai'
import { mapContainerDimensions, selectedItemAtom, stageAtom, stageRefAtom } from '~/lib/atoms/main'
import Konva from 'konva'
import valueFromWindowWidth from '~/lib/intersections/valueFromWindowWidth'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import AddEllementSheet from './add-ellement-sheet'
import { cn } from '~/lib/utils'

export default function AddEllementButton({
  className
}: {
  className?: string
}) {
  const { width: windowW } = useAtomValue(mapContainerDimensions);

  const stage = useAtomValue(stageAtom)
  const stageRef = useAtomValue(stageRefAtom)

  const [addEllement, setAddEllement] = React.useState(false)
  const [mapItem, setMapItem] = React.useState<MapItemSchema | null>(null)
  const [openAddEllementSheet, setOpenAddEllementSheet] = React.useState(false)

  const selectedItem = useAtomValue(selectedItemAtom)

  const scale = valueFromWindowWidth({
    windowW,
    w1024: 1.2/stage.scale,
    w425: 1.8/stage.scale,
    minw: 2.4/stage.scale,
  })

  // Effect for Add and Drag new item
  React.useEffect(() => {
    const layer = new Konva.Layer({name: "add-layer"})
    stageRef?.add(layer);

    const shape = new Konva.Circle({
      name: "shape",
      x: 0,
      y: 0,
      scale: {x: scale, y: scale},
      fill: 'black',
      radius: 7,
      draggable: true
    })

    function handleClick() {
      const pos = layer.getRelativePointerPosition();
      if (addEllement && pos) {
        shape.x(pos.x)
        shape.y(pos.y)
    
        layer.add(shape);

        setMapItem({
          xPos: pos.x,
          yPos: pos.y,
          description: null,
        });
      }
    }
    function handleDragStart() {
      shape.moveToTop();
    }
    function handleDragEnd() {
      setMapItem({
        xPos: shape.getPosition().x,
        yPos: shape.getPosition().y,
        description: null,
      });
    }

    stageRef?.addEventListener('click', handleClick);
    shape.addEventListener('dragstart', handleDragStart);
    shape.addEventListener('dragend', handleDragEnd);
    shape.on('mouseover', function() {
      document.body.style.cursor = "move";
    });
    shape.on('mouseout', function() {
      document.body.style.cursor = "default";
    });


    return () => {
      stageRef?.removeEventListener('click');
      shape?.removeEventListener('dragstart');
      shape?.removeEventListener('dragend');
      shape.remove()
      layer.remove()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addEllement, stageRef])

  const onOpenChange = React.useCallback((open: boolean) => {
    setOpenAddEllementSheet(open)
    if (!open) {
      setAddEllement(false);
      setMapItem(null);
    }
  }, [])

  const onDismiss = () => {
    setAddEllement(false);
    setMapItem(null);
    toast.dismiss("accept-pos")
  }

  const onAccept = React.useCallback(() => {
    setOpenAddEllementSheet(true)
    setAddEllement(false);
    toast.dismiss("accept-pos")
  }, [])

  // Effect for accept item Position and open Sheet for data input
  React.useEffect(() => {
    if (!!mapItem) {
      toast('Подтвердите расположение элемента', {
        id: "accept-pos",
        description: "Вы можете перетаскивать метку",
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
    }
  }, [mapItem, onAccept])

  // Effect for selectedItem
  React.useEffect(() => {
    if (!!selectedItem) onDismiss()
  }, [selectedItem])

  // Effect for cancle
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!mapItem) {
        if (addEllement && event.key === "Escape") {
          onOpenChange(false)
        }
      }
      if (mapItem) {
        if (addEllement && event.key === "Escape") {
          onDismiss()
        }
        if (addEllement && event.key === "Enter") {
          event.preventDefault()
          onAccept()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mapItem, onOpenChange, onAccept, addEllement])

  function getButtonContent() {
    if (mapItem && !openAddEllementSheet) return {
      title: "Подтвердите расположение элемента...",
      icon: <MapPinCheck className="size-4 flex-none" />,
    }
    if (mapItem) return { 
      title:"Введите данные", 
      icon: <Database className="size-4 flex-none" />
    };
    if (addEllement) return { 
      title: "Кликнете в нужном месте на карте...", 
      icon: <MapIcon className="size-4 flex-none" /> 
    }
    return {
      title: "Добавить метку",
      icon: <Plus className="size-4 flex-none" />
    }
  }
  
  return (
    <>
      <Button
        aria-label="Добавить метку"
        variant="ghost"
        disabled={addEllement || !!mapItem || !!selectedItem}
        className={cn("h-8 px-2 lg:px-3", className)}
        onClick={() => setAddEllement(true)}
      >
        {getButtonContent().title}
        {getButtonContent().icon}
      </Button>
      <AddEllementSheet
        open={openAddEllementSheet}
        onOpenChange={onOpenChange}
        mapItem={mapItem}
      />
    </>
  )
}
