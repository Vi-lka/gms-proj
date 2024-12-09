"use client"

import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip';
import { useMouse } from '~/hooks/use-mouse';

export default function TooltipMouse({
  description,
  children,
  open,
}: {
  description: string,
  children: React.ReactNode,
  open: boolean,
}) {
  const { ref, x, y } = useMouse();
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip open={open}>
        <TooltipTrigger asChild>
          <div className='' ref={ref}>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent
          align="start"
          alignOffset={x}
          sideOffset={-y + 10}
          hideWhenDetached
        >
          <div>{description}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
