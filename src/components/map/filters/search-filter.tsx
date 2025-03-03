import { CircleHelp, Loader, SearchIcon, XIcon } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '~/components/ui/dropdown-menu'
import { InputIcon } from '~/components/ui/special/input-icon'
import { useMapItemsSearch } from './hooks'
import { useDebounce } from '~/hooks/use-debounce'
import { cn } from '~/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

export default function SearchFilter() {
  const [open, setOpen] = React.useState(false)
  const [tooltipOpen, setTooltipOpen] = React.useState(false)

  const [isPending, startTransition] = React.useTransition()

  const [{search}, setSearchFilter] = useMapItemsSearch()

  const [searchValue, setSearchValue] = React.useState(search)
  const debouncedValue = useDebounce(searchValue, 300)

  React.useEffect(() => {
    if (debouncedValue !== null && debouncedValue !== search) startTransition(async () => {
      await setSearchFilter(old => ({
        ...old,
        search: debouncedValue.length > 0 ? debouncedValue : null
      }))
    })
  }, [debouncedValue, search, setSearchFilter])

  return (
    <DropdownMenuSub open={open} onOpenChange={setOpen}>
      <DropdownMenuSubTrigger className='flex items-center justify-between' classNameChevron="ml-0">
        Поиск
        {!open && isPending ? <Loader className='ml-2 text-muted-foreground flex-none animate-spin' /> : null}
        <TooltipProvider delayDuration={300}>
          <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
            <TooltipTrigger 
              className='ml-auto p-1 cursor-help' 
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setTooltipOpen(true)
              }}
            >
              <CircleHelp className='!w-3 !h-3 text-muted-foreground/60'/>
            </TooltipTrigger>
            <TooltipContent sideOffset={10} asChild onPointerOut={() => setTooltipOpen(false)}>
              <div className="backdrop-blur supports-[backdrop-filter]:bg-muted/60 dark:shadow-secondary bg-muted/60 shadow rounded-md p-1.5">
                <p className='text-foreground text-xs font-light'>
                  Поиск по <span className='font-medium'>Названиям</span> Компаний, Месторождений, и тд.
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className='flex items-center gap-2 p-2 md:max-w-96 max-w-64 z-10' alignOffset={-10} sideOffset={4}>
        <div className='flex flex-col'>
          <InputIcon
            value={searchValue ?? ""}
            onChange={(event) => {
              setSearchValue(event.target.value)
            }}
            type='search' 
            icon={isPending ? Loader : SearchIcon}
            iconProps={{ 
              behavior: 'prepend',
              className: cn(isPending ? 'animate-spin' : '')
            }} 
            placeholder='Поиск...'
          />
        </div>
        <Button 
          variant="ghost"
          className='w-fit h-fit p-2 rounded-md z-20'
          disabled={isPending}
          onClick={() => setOpen(false)}
        >
          <XIcon size={14} className='text-muted-foreground'/>
        </Button>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
