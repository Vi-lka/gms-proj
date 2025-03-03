import { Edit, Move, Trash2, X } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { Kbd } from '~/components/ui/kbd'
import { Portal } from '~/components/ui/portal'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import UpdateEllementSheet from './update-ellement-sheet'
import DeleteEllementDialog from './delete-ellement-dialog'
import dynamic from 'next/dynamic'
import { useAtom } from 'jotai'
import { itemActionAtom, selectedItemAtom } from '~/lib/atoms/main'

const MoveEllementPortal = dynamic(() => import('./move-ellement-portal'), {
  ssr: false,
});

export default function MapItemsActionsAdmin() {
  const [itemAction, setItemAction] = useAtom(itemActionAtom)
  const [selectedItem, setSelectedItem] = useAtom(selectedItemAtom)

  // Handle key press
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (selectedItem && !itemAction) {
        if (event.key === "Escape") {
          setSelectedItem(null)
          setItemAction(null)
        }
        if ((event.key === 'e') || (event.key === 'у')) {
          setItemAction("update")
        }
        if (event.key === 'Shift') {
          setItemAction("move")
        }
        if (event.key === "Delete") {
          setItemAction("delete")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [itemAction, selectedItem, setItemAction, setSelectedItem])

  function onOpenChange(open: boolean) {
    if (!open) setItemAction(null)
  }

  function onFormSubmit() {
    setItemAction(null)
    setSelectedItem(null)
  }

  if (!selectedItem) return null

  if (itemAction === "move") return (
    <MoveEllementPortal
      id={selectedItem.id}
      open={itemAction === "move"}
      onOpenChange={onOpenChange}
      onFormSubmit={onFormSubmit}
    />
  )

  return (
    <>
      <UpdateEllementSheet 
        item={selectedItem}
        open={itemAction === "update"}
        onOpenChange={onOpenChange}
        onFormSubmit={onFormSubmit}
      />
      <DeleteEllementDialog 
        item={selectedItem}
        open={itemAction === "delete"}
        onOpenChange={onOpenChange}
        onFormSubmit={onFormSubmit}
      />
      <Portal>
        <TooltipProvider delayDuration={300}>
          <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit px-2.5">
            <div className="w-full overflow-x-auto">
              <div className="mx-auto flex w-fit items-center gap-2 rounded-md border bg-background p-1 text-foreground shadow">
                <div className="flex h-12 items-center rounded-md border border-dashed border-yellow p-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className="size-8 hover:border mr-2"
                        onClick={() => setItemAction("update")}
                      >
                        <Edit className="size-4 shrink-0" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="flex items-center border bg-accent px-2 py-1 font-semibold text-foreground">
                      <p className="mr-2">Изменить</p>
                      <Kbd abbrTitle="E" variant="outline">
                        E
                      </Kbd>
                    </TooltipContent>
                  </Tooltip>
    
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className="size-8 hover:border"
                        onClick={() => setItemAction("move")}
                      >
                        <Move className="size-4 shrink-0" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="flex items-center border bg-accent px-2 py-1 font-semibold text-foreground">
                      <p className="mr-2">Переместить</p>
                      <Kbd abbrTitle="Shift" variant="outline">
                        Shift
                      </Kbd>
                    </TooltipContent>
                  </Tooltip>
    
                  <Separator orientation="vertical" className="ml-2 mr-2" />
    
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="size-8 hover:border"
                        onClick={() => setItemAction("delete")}
                      >
                        <Trash2 className="size-4 shrink-0" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="flex items-center border bg-accent px-2 py-1 font-semibold text-foreground">
                      <p className="mr-2">Удалить</p>
                      <Kbd abbrTitle="Delete" variant="outline">
                        Delete
                      </Kbd>
                    </TooltipContent>
                  </Tooltip>
    
                  <Separator orientation="vertical" className="ml-2 mr-1" />
    
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 hover:border"
                        onClick={() => setSelectedItem(null)}
                      >
                        <X className="size-4 shrink-0" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="flex items-center border bg-accent px-2 py-1 font-semibold text-foreground">
                      <p className="mr-2">Очистить выбор</p>
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
    </>
  )
}
