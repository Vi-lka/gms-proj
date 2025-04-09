import React from 'react'
import { Portal } from '../ui/portal'
import Link from 'next/link'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Button } from '../ui/button'
import { cn } from '~/lib/utils'
import { Table2 } from 'lucide-react'

export default function MapOpenTable() {
  return (
    <Portal>
      <TooltipProvider>
        <Tooltip delayDuration={150}>
          <Link href={'/tables'} passHref className="absolute bottom-0 right-0 z-50">
            <TooltipTrigger asChild>
              <Button
                className={cn(
                  "fixed right-6 bottom-6 z-50 w-fit h-fit p-2.5 rounded-full aspect-square",
                  "shadow border dark:border-none border-muted-foreground text-foreground hover:text-primary-foreground",
                  "backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary bg-background/60"
                )}
              >
                <Table2 className='aspect-square opacity-90'/>
              </Button>
            </TooltipTrigger>
          </Link>
          <TooltipContent side="left">Табличный вид</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Portal>
  )
}
