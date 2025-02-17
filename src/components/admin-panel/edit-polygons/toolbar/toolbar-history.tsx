"use client"

import React from 'react'
import { History, Redo, Undo } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Kbd } from '~/components/ui/kbd';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider';

export default function ToolbarHistory({
  disabled,
  className
}: {
  disabled?: boolean,
  className?: string
}) {
  const { undo, redo, pastStates, futureStates } = useTemporalStore((state) => state)

  const openSheet = usePolyStore((state) => state.openSheet)

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (openSheet) return;
      if (canUndo && event.ctrlKey && !event.shiftKey && event.code === 'KeyZ') {
        undo()
      }
      if (canRedo && event.ctrlKey && event.shiftKey && event.code === 'KeyZ') {
        redo()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canRedo, canUndo, openSheet, redo, undo])

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-1', className)}>
        <div className='flex items-center'>
          <History size={16} className='flex-none' />
          <span>:</span>
        </div>
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              className="gap-2 w-7 h-7"
              disabled={!!disabled || !canUndo}
              onClick={() => undo()}
            >
              <Undo size={16} className='flex-none' />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="p-2 flex items-center gap-2">
            <p>Назад</p>
            <Kbd abbrTitle="Ctrl+Z" variant="outline">
              Ctrl+Z
            </Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip delayDuration={150}>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              className="gap-2 w-7 h-7"
              disabled={!!disabled || !canRedo}
              onClick={() => redo()}
            >
              <Redo size={16} className='flex-none' />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="p-2 flex items-center gap-2">
            <p>Вперед</p>
            <Kbd abbrTitle="Ctrl+Shift+Z" variant="outline">
              Ctrl+Shift+Z
            </Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
