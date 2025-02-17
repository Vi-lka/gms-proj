"use client"

import { Edit, Move, Trash2, X } from 'lucide-react'
import React from 'react'
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider'
import { Button } from '~/components/ui/button'
import { Kbd } from '~/components/ui/kbd'
import { Portal } from '~/components/ui/portal'
import { Separator } from '~/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import UpdatePolygonSheet from './update-polygon-sheet'
import DeletePolygonDialog from './delete-polygon-dialog'
import MovePolygonPortal from './move-polygon-portal'

export default function EditPolygonsActions() {
  const fieldId = usePolyStore((state) => state.fieldId)
  const polygons = usePolyStore((state) => state.polygons)
  const editPolygonIndex = usePolyStore((state) => state.editPolygonIndex)
  const editPolygonAction = usePolyStore((state) => state.editPolygonAction)
  const setEditPolygonAction = usePolyStore((state) => state.setEditPolygonAction)
  const setGlobalState = usePolyStore((state) => state.setGlobalState)

  const { clear, pastStates } = useTemporalStore((state) => state)

  function onOpenChange(open: boolean) {
    if (!open) setEditPolygonAction(null)
  }

  const clearSelection = React.useCallback(() => {
    const returnPastState = pastStates[0]

    setGlobalState((prev) => ({
      ...prev,
      ...returnPastState,
      editPolygonIndex: null,
      editPolygonAction: null,
    }))
    clear()
  }, [pastStates, clear, setGlobalState])

  // Handle key press
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (editPolygonIndex !== null && !editPolygonAction) {
        if (event.key === "Escape") {
          clearSelection()
        }
        if ((event.key === 'e') || (event.key === 'у')) {
          setEditPolygonAction("update")
        }
        if (event.key === 'Shift') {
          setEditPolygonAction("move")
        }
        if (event.key === "Delete") {
          setEditPolygonAction("delete")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [editPolygonAction, editPolygonIndex, clearSelection, setEditPolygonAction])

  if (editPolygonIndex === null) return null;

  if (editPolygonAction === "move") return (
    <MovePolygonPortal
      open={editPolygonAction === "move"}
      onOpenChange={onOpenChange} 
      saveToBackEnd={false}
    />
  )

  return (
    <>
      <UpdatePolygonSheet 
        open={editPolygonAction === "update"}
        onOpenChange={onOpenChange}
        saveToBackEnd={false}
        searchParams={{
          fieldId: fieldId ?? undefined,
        }}
      />
      <DeletePolygonDialog 
        open={editPolygonAction === "delete"}
        onOpenChange={onOpenChange}
        saveToBackEnd={false}
      />
      <Portal>
        <TooltipProvider delayDuration={300}>
          <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit px-2.5">
            <div className="w-full overflow-x-auto">
              <div className="mx-auto flex flex-col w-fit items-center gap-1 rounded-md border bg-background p-1 text-foreground shadow">
                <p className='text-xs text-center'>{polygons[editPolygonIndex]?.licensedArea?.name}</p>
                <div className="flex h-12 items-center rounded-md border border-dashed border-yellow p-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className="size-8 hover:border mr-2"
                        onClick={() => setEditPolygonAction("update")}
                      >
                        <Edit className="size-4 shrink-0" aria-hidden="true" />
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
                        onClick={() => setEditPolygonAction("move")}
                      >
                        <Move className="size-4 shrink-0" aria-hidden="true" />
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
                        onClick={() => setEditPolygonAction("delete")}
                      >
                        <Trash2 className="size-4 shrink-0" aria-hidden="true" />
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
                        onClick={clearSelection}
                      >
                        <X className="size-4 shrink-0" aria-hidden="true" />
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
