import React from 'react'
import { useMapItemsSearch } from '../hooks'
import { DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '~/components/ui/dropdown-menu'
import { Delete, Loader, Plus, XIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { cn, idToSentenceCase } from '~/lib/utils'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { Separator } from '~/components/ui/separator'
import ElementsFilterInputs from './elements-filter-inputs'
import { v4 as uuidv4 } from 'uuid';
import TooltipHelp from '~/components/ui/special/tooltip-help'

export default function ElementsFilter() {
  const [open, setOpen] = React.useState(false)

  const [accordionValue, setAccordionValue] = React.useState<string>("0")

  const [isPending, startTransition] = React.useTransition()

  const [{elements}, setSearchFilter] = useMapItemsSearch()

  return (
    <DropdownMenuSub open={open} onOpenChange={setOpen}>
      <DropdownMenuSubTrigger className='flex items-center justify-between' classNameChevron="ml-0">
        Значения Элементов
        {!open && isPending ? <Loader className='ml-2 text-muted-foreground flex-none animate-spin' /> : null}
        <TooltipHelp>
          <p className='text-foreground text-xs font-light'>
            Фильтрация по значениям <span className='font-medium'>добываемых элементов</span> 
            <br/>
            <br/>
            Элементы, не вошедшие в первые 5, появятся на карте
            <br/>
            на месте минимального значения.
          </p>
        </TooltipHelp>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent 
        alignOffset={-20} 
        sideOffset={4}
        className='relative flex flex-col gap-0 p-4 md:w-96 w-64 z-0'
        onInteractOutside={() => setOpen(false)}
      >
        <Button 
          variant="ghost"
          className='absolute w-fit h-fit p-0.5 right-0.5 top-1 rounded-md z-20'
          disabled={isPending}
          onClick={() => setOpen(false)}
        >
          <XIcon size={14} className='text-muted-foreground'/>
        </Button>
        <ScrollArea classNameViewport={cn(
          'max-h-64 pr-2',
          !!elements && elements.length > 0 && 'h-64'
        )}>
          <Accordion 
            type="single" 
            collapsible 
            disabled={isPending}
            value={accordionValue} 
            onValueChange={setAccordionValue}
          >
            {elements?.map((item, indx) => (
              <AccordionItem 
                key={item.id}
                disabled={isPending} 
                value={item.id} 
                className='w-full border-b-2'
              >
                <AccordionTrigger disabled={isPending} className='w-full py-2 justify-end gap-2'>
                  <span className='font-semibold' style={{lineHeight: "20px"}}>{idToSentenceCase(item.element ?? "__") + " "}</span>
                  <Separator orientation="vertical" className='w-[2px]'/>
                  <p className='font-normal text-xs'>
                    {item.min && <span>Min: {item.min}</span>}
                    {item.max && <span>; Max: {item.max}</span>}
                  </p>
                    <Button
                      type='button'
                      asChild
                      className='w-fit h-fit p-1 mr-1 z-50'
                      disabled={isPending}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        startTransition(async () => {
                          await setSearchFilter(old => {
                            if (!old.elements) return old;
                            return {
                              ...old,
                              elements: old.elements.length === 1 ? null : old.elements.filter((oldItem) => item.id !== oldItem.id)
                            }
                          }).then(() => {
                            setAccordionValue(elements[indx-1]?.id ?? "0")
                          })
                        })
                      }}
                    >
                      <Delete size={16} className='!rotate-0'/>
                    </Button>
                </AccordionTrigger>
                <AccordionContent key={item.id} className='flex flex-col gap-2 border-2 border-b-0 border-boder rounded-t-lg p-3'>
                  <ElementsFilterInputs
                    value={item}
                    id={item.id}
                    isPending={isPending}
                    startTransition={startTransition}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
        <Button
          variant="outline"
          className='w-full mt-2 text-sm p-1.5 h-fit'
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const id = uuidv4()
              await setSearchFilter(old => {
                if (!old.elements) return {
                  ...old,
                  elements: [{
                    id,
                    element: null,
                    max: null,
                    min: null,
                  }]
                }
                return {
                  ...old,
                  elements: [...old.elements, {
                    id,
                    element: null,
                    max: null,
                    min: null,
                  }]
                }
              }).then(() => {
                setAccordionValue(id)
              })
            })
          }}
        >
        {isPending 
          ? <Loader size={20} className='text-muted-foreground flex-none animate-spin' /> 
          : <>Добавить <Plus size={20} className='flex-none' /></>
        }
        </Button>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}