import { Check, CircleHelp, Loader, XIcon } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '~/components/ui/command'
import { DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '~/components/ui/dropdown-menu'
import { cn, idToSentenceCase } from '~/lib/utils'
import { useElementsSearch } from './hooks'
import { ELEMENTS } from '~/lib/static/elements'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'

export default function ElementsViewFilter() {
  const [open, setOpen] = React.useState(false)
  const [tooltipOpen, setTooltipOpen] = React.useState(false)

  const [isPending, startTransition] = React.useTransition()

  const [elementsSearch, setElementsSearch] = useElementsSearch()

  const onSelect = (element: ELEMENTS) => {
    startTransition(async () => {
      await setElementsSearch(old => {
        if (!old) return [element]
        if (old.includes(element)) {
          if (old.length === 1) return null
          return old.filter(item => item !== element)
        }
        return [...old, element]
      })
    })
  }

  const onClear = () => {
    if (!isPending) startTransition(async () => {
      await setElementsSearch(null)
    })
  }

  return (
    <DropdownMenuSub open={open} onOpenChange={setOpen}>
      <DropdownMenuSubTrigger className='flex items-center justify-between' classNameChevron="ml-0">
        Элементы
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
                  Фильтрация по <span className='font-medium'>наличию добываемых элементов</span>
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className='relative max-w-64 z-10' alignOffset={-10} sideOffset={4}>
        <Button 
          variant="ghost"
          className='absolute w-fit h-fit p-0.5 right-1 top-1 rounded-md z-20'
          disabled={isPending}
          onClick={() => setOpen(false)}
        >
          <XIcon size={14} className='text-muted-foreground'/>
        </Button>
        <Command className='relative'>
          <CommandInput placeholder="Поиск..." className='w-5/6' disabled={isPending} />
          {isPending && <Loader className="absolute top-3 right-6 size-4 animate-spin text-muted-foreground z-10" />}
          <Button 
            variant="ghost"
            className={cn(
              'w-full text-muted-foreground font-normal gap-1',
              // This is because props (like disabled) or conditional rendering for this button 
              // somehow breaks DropdownMenuSub closing on hovering other sub menus.
              // So we just hide it with css.
              (!elementsSearch || elementsSearch.length === 0) && 'hidden',
              isPending && 'cursor-default pointer-events-none'
            )}
            onClick={onClear}
          >
            Очистить <XIcon size={16}/>
          </Button>
          <CommandList>
            <CommandEmpty>Не найдено.</CommandEmpty>
            <CommandGroup>
              {Object.values(ELEMENTS).map((element) => (
                <CommandItem
                  key={element}
                  disabled={isPending}
                  onSelect={() => onSelect(element)}
                >
                  <span className="truncate">
                    {idToSentenceCase(element)}
                  </span>
                  <Check
                    className={cn(
                      "ml-auto size-4 shrink-0",
                      elementsSearch?.includes(element) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
