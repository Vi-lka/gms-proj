import React from 'react'
import { Button } from '~/components/ui/button'
import { useElementsSearch, useMapItemsSearch } from './hooks'
import { Loader, XIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { useSearchParams } from 'next/navigation'
import { cn } from '~/lib/utils'

export default function ClearFiltersButton({
  disabled,
  className
}: {
  disabled?: boolean,
  className?: string
}) {
  const searchParams = useSearchParams()
  const [, setElementsSearch] = useElementsSearch()
  const [, setMapItemsSearch] = useMapItemsSearch()

  const [isPending, startTransition] = React.useTransition()

  const onClear = async () => {
    startTransition(async () => {
      await setElementsSearch(null)
      await setMapItemsSearch({
        search: null,
        elements: null,
        comapniesIds: null
      })
    })
  }

  if (searchParams.size === 0) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            disabled={isPending || disabled}
            size="sm"
            className={cn('p-2 h-fit aspect-square text-xs font-normal text-muted-foreground', className)}
            onClick={onClear}
          >
            {isPending ? <Loader size={18} className='animate-spin' /> : <XIcon size={18} />}
          </Button>
        </TooltipTrigger>
        <TooltipContent asChild>
          <div className="backdrop-blur supports-[backdrop-filter]:bg-muted/60 dark:shadow-secondary bg-muted/60 shadow rounded-md p-1.5">
            <p className='text-foreground text-xs font-medium'>
              Сброс
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
