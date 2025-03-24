"use client"

import React from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip'
import useOutsideClick from '~/hooks/use-outside-click'

type ContentProps = React.ComponentPropsWithoutRef<typeof TooltipContent>

type Props = {
  trigger: React.ReactNode,
  children: React.ReactNode,
  className?: string,
  classNameContent?: string,
  side?: ContentProps['side'],
  align?: ContentProps['align'],
  sideOffset?: ContentProps['sideOffset']
  alignOffset?: ContentProps['alignOffset'],
  triggerAsChild?: boolean
  contentAsChild?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement> 
}

export default function TooltipClick({
  trigger,
  children,
  className,
  classNameContent,
  side,
  align,
  sideOffset,
  alignOffset,
  triggerAsChild,
  contentAsChild,
  onClick,
}: Props) {
  const [tooltipOpen, setTooltipOpen] = React.useState(false)
  const ref = useOutsideClick(100, () => setTooltipOpen(false));

  return (
    <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger 
        className={className}
        asChild={triggerAsChild}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setTooltipOpen(true)
          onClick?.(e)
        }}
      >
        {trigger}
      </TooltipTrigger>
      <TooltipContent 
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        asChild={contentAsChild}
        className={classNameContent}
        onPointerOut={() => setTooltipOpen(false)}
      >
        {children}
      </TooltipContent>
    </Tooltip>
  )
}
