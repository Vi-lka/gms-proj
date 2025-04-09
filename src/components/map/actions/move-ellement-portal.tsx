import { useAtomValue } from 'jotai';
import Konva from 'konva';
import { Check, Loader, X } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Kbd } from '~/components/ui/kbd';
import { Portal } from '~/components/ui/portal';
import { Separator } from '~/components/ui/separator';
import { errorToast } from '~/components/ui/special/error-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { useRevertStageEllementPos } from '~/hooks/use-stage-ellement-pos';
import { mapContainerDimensions, stageAtom, stageRefAtom } from '~/lib/atoms/main';
import valueFromWindowWidth from '~/lib/intersections/valueFromWindowWidth';
import { type MapItemSchema } from '~/lib/validations/forms';
import { moveMapItem } from '~/server/actions/mapItems';

interface MoveEllementPortalProps extends React.ComponentPropsWithRef<typeof Portal> {
  id: string,
  open: boolean,
  onOpenChange: (open: boolean) => void,
  onFormSubmit: (() => void) | undefined,
}

export default function MoveEllementPortal({ 
  id,
  open,
  onOpenChange,
  onFormSubmit,
  ...props
}: MoveEllementPortalProps) {
  const [isPending, startTransition] = React.useTransition()

  const { width: windowW } = useAtomValue(mapContainerDimensions);

  const stage = useAtomValue(stageAtom)
  const stageRef = useAtomValue(stageRefAtom)

  const [mapItem, setMapItem] = React.useState<MapItemSchema | null>(null)

  const revertMapItem = useRevertStageEllementPos(
    { x: mapItem?.xPos ?? 0, y: mapItem?.yPos ?? 0 }
  )

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
      if (open && pos) {
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
  }, [open, stageRef])

  const onDismiss = () => {
    setMapItem(null);
    toast.dismiss("accept-pos")
  }

  const onAccept = React.useCallback(() => {
    startTransition(async () => {
      const { error } = await moveMapItem({
        id,
        xPos: revertMapItem.pos.x,
        yPos: revertMapItem.pos.y,
      })
    
      if (error) {
        errorToast(error, {id: "data-error"})
        return
      }
    
      onOpenChange(false)
      onFormSubmit?.()
      toast.success("Элемент перемещен!")
      toast.dismiss("accept-pos")
    })
  }, [id, revertMapItem.pos.x, revertMapItem.pos.y, onFormSubmit, onOpenChange])

  // Effect for accept item Position
  React.useEffect(() => {
    if (!!mapItem) {
      toast('Подтвердите расположение элемента', {
        id: "accept-pos",
        description: "Вы можете перетаскивать метку",
        duration: Infinity,
        position: "bottom-center",
        action: {
          label: isPending 
            ? <Loader className="size-4 animate-spin" />
            : <Check className="size-4" />,
          onClick: onAccept,
        },
        cancel: {
          label: <X className="size-4" />,
          onClick: onDismiss,
        },
        onDismiss
      });
    }
  }, [isPending, mapItem, onAccept])

  // Effect for cancle
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (open && !mapItem) {
        if (event.key === "Escape") {
          onOpenChange(false)
        }
      }
      if (open && mapItem) {
        if (event.key === "Escape") {
          onDismiss()
        }
        if (event.key === "Enter") {
          onAccept()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mapItem, open, onOpenChange, onAccept])

  if (mapItem) return null

  if (!open) return null

  return (
    <Portal {...props}>
      <TooltipProvider delayDuration={300}>
        <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit px-2.5">
          <div className="w-full overflow-x-auto">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-md border bg-background p-1 text-foreground shadow">
              <div className="flex h-12 items-center rounded-md border border-dashed border-yellow p-2">
                <p className='font-normal text-sm'>Кликнете в нужном месте на карте...</p>
                <Separator orientation="vertical" className="ml-2 mr-1" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 hover:border"
                      onClick={() => onOpenChange(false)}
                    >
                      <X className="size-4 shrink-0" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="flex items-center border bg-accent px-2 py-1 font-semibold text-foreground">
                    <p className="mr-2">Отменить</p>
                    <Kbd abbrTitle="Escape" variant="outline">
                      Esc
                    </Kbd>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </Portal>
  )
}
