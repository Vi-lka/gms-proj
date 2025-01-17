"use client"

import React from 'react'
import { Check, Database, Map, Plus, X } from 'lucide-react'
import { type MapItemSchema } from '~/lib/validations/forms'
import { useAtomValue } from 'jotai'
import { mapContainerDimensions, stageAtom, stageRefAtom } from '~/lib/atoms/main'
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

  // Effect for accept item Position and open Sheet for data input
  React.useEffect(() => {
    const onDismiss = () => {
      setAddEllement(false);
      setMapItem(null);
    }

    const onAccept = () => {
      setOpenAddEllementSheet(true)
    }

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
  }, [mapItem])

  function getButtonContent() {
    if (mapItem) return { 
      title:"Введите данные", 
      icon: <Database className="size-4" aria-hidden="true" />
    };
    if (addEllement) return { 
      title: "Кликнете в нужном месте на карте...", 
      icon: <Map className="size-4" aria-hidden="true" /> 
    }
    return {
      title: "Добавить метку",
      icon: <Plus className="size-4" aria-hidden="true" />
    }
  }

  const onOpenChange = (open: boolean) => {
    setOpenAddEllementSheet(open)
    if (!open) {
      setAddEllement(false);
      setMapItem(null);
    }
  }
  
  return (
    <>
      <Button
        aria-label="Добавить метку"
        variant="ghost"
        disabled={addEllement || !!mapItem}
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
