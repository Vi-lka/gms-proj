"use client"

import React from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip';
import { useMouse } from '~/hooks/use-mouse';

export default function TooltipMouse({
  description,
  children,
  open,
  className,
}: {
  description: React.ReactNode,
  children: React.ReactNode,
  open: boolean,
  className?: string;
}) {
  const { ref, x, y } = useMouse();
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip open={open}>
        <TooltipTrigger asChild>
          <div className={className} ref={ref}>
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
