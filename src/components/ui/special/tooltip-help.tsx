import { CircleHelp } from 'lucide-react'
import React from 'react'
import TooltipClick from '~/components/ui/special/tooltip-click'
import { TooltipProvider } from '../tooltip'

export default function TooltipHelp({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <TooltipClick 
        trigger={<CircleHelp className='!w-3 !h-3 text-muted-foreground/60'/>} 
        sideOffset={10}
        className='ml-auto p-1 cursor-help'
        contentAsChild
      >
        <div className="backdrop-blur supports-[backdrop-filter]:bg-muted/60 dark:shadow-secondary bg-muted/60 shadow rounded-md p-1.5">
          {children}
        </div>
      </TooltipClick>
    </TooltipProvider>
  )
}
