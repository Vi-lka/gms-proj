import { Check, Loader, X } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider';
import { Button } from '~/components/ui/button';
import { Kbd } from '~/components/ui/kbd';
import { Portal } from '~/components/ui/portal'
import { Separator } from '~/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

interface MovePolygonPortalProps extends React.ComponentPropsWithRef<typeof Portal> {
  open: boolean,
  onOpenChange: (open: boolean) => void,
  saveToBackEnd: boolean;
  onSubmit?:() => void
}


export default function MovePolygonPortal({ 
  open,
  onOpenChange,
  saveToBackEnd,
  onSubmit,
  ...props
}: MovePolygonPortalProps) {
  const [isPending, startTransition] = React.useTransition()

  const setGlobalState = usePolyStore((state) => state.setGlobalState)

  const { clear, pastStates } = useTemporalStore((state) => state)

  const hasPastState = pastStates.length > 0

  const onDismiss = React.useCallback(() => {
    const returnPastState = pastStates[0]

    setGlobalState((prev) => ({
      ...prev,
      ...returnPastState
    }))
    clear()

    toast.dismiss("accept-change-polygon-pos")
  }, [pastStates, clear, setGlobalState])

  const onAccept = React.useCallback(() => {
    setGlobalState((prev) => ({
      ...prev,
      editPolygonIndex: null,
      editPolygonAction: null,
    }))
    clear()

    if (saveToBackEnd) {
      startTransition(async () => {
        // const { error } = await deleteMapItem(item)

        // if (error) {
        //   toast.error(error)
        //   return
        // }

        onSubmit?.()
        toast.success("Полигон перемещен!")
      })
    }
    onOpenChange(false)
    toast.dismiss("accept-change-polygon-pos")
  }, [saveToBackEnd, setGlobalState, clear, onOpenChange, onSubmit])

  // Effect for accept item Position
  React.useEffect(() => {
    if (hasPastState) {
      toast('Подтвердите расположение полигона', {
        id: "accept-change-polygon-pos",
        description: "Вы можете перетаскивать полигон и его края",
        duration: Infinity,
        position: "bottom-center",
        action: {
          label: isPending 
           ? (
            <Loader
              className="mr-2 size-4 animate-spin"
              aria-hidden="true"
            />
          ) 
          : <Check className="size-4" />,
          onClick: onAccept,
        },
        cancel: {
          label: <X className="size-4" />,
          onClick: onDismiss,
        },
        onDismiss
      });
    } else {
      toast.dismiss("accept-change-polygon-pos")
    }
  }, [hasPastState, isPending, onAccept, onDismiss])

  // Effect for cancle
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (open && !hasPastState) {
        if (event.key === "Escape") {
          onOpenChange(false)
        }
      }
      if (open && hasPastState) {
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
  }, [open, hasPastState, onOpenChange, onDismiss, onAccept])

  if (!open || hasPastState) return null

  return (
    <Portal {...props}>
      <TooltipProvider delayDuration={300}>
        <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit px-2.5">
          <div className="w-full overflow-x-auto">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-md border bg-background p-1 text-foreground shadow">
              <div className="flex h-12 items-center rounded-md border border-dashed border-yellow p-2">
                <p className='font-normal text-sm'>Переместите полигон или его края...</p>
                <Separator orientation="vertical" className="ml-2 mr-1" />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 hover:border"
                      onClick={() => {
                        onOpenChange(false)
                        clear()
                      }}
                    >
                      <X className="size-4 shrink-0" aria-hidden="true" />
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
  );
}
