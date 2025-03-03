import React from 'react'
import { useMapItemsSearch } from '../hooks'
import { type ElementsSearchSchema } from '~/lib/validations/search-params'
import { ELEMENTS } from '~/lib/static/elements'
import { useDebounce } from '~/hooks/use-debounce'
import { Label } from '~/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Button } from '~/components/ui/button'
import { Check, ChevronsUpDownIcon, Loader } from 'lucide-react'
import { cn, idToSentenceCase } from '~/lib/utils'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '~/components/ui/command'
import { Input } from '~/components/ui/input'
import { v4 as uuidv4 } from 'uuid';

export default function ElementsFilterInputs({
  id,
  value,
  isPending,
  startTransition,
}: {
  id: string,
  value: ElementsSearchSchema,
  isPending: boolean,
  startTransition: React.TransitionStartFunction
}) {
  return (
    <div className='flex flex-wrap gap-2'>
      <ElementInput id={id} value={value.element} isPending={isPending} startTransition={startTransition} />
      <div className='flex items-center gap-2'>
        <MinMaxInput type="min" id={id} value={value.min} disabled={!value.element} startTransition={startTransition} />
        <MinMaxInput type="max" id={id} value={value.max} disabled={!value.element} startTransition={startTransition} />
      </div>
    </div>
  )
}

function MinMaxInput({
  type,
  id,
  value,
  startTransition,
  disabled
}: {
  type: "min" | "max",
  id: string,
  value: ElementsSearchSchema["min"],
  startTransition: React.TransitionStartFunction,
  disabled?: boolean
}) {
  const [selectedV, setSelectedV] = React.useState(value)

  const debouncedV = useDebounce(selectedV, 500)

  const [, setSearchFilter] = useMapItemsSearch()

  React.useEffect(() => {
    if (disabled) return;
    if (debouncedV !== value) startTransition(async () => {
      await setSearchFilter(old => {
        if (!old.elements) return old;
        return {
          ...old,
          elements: old.elements.map(item => {
            if (item.id !== id) return item;
            if (type === "min") return {
              ...item,
              min: debouncedV
            }
            if (type === "max") return {
              ...item,
              max: debouncedV
            }
            return item;
          })
        }
      })
    })
  }, [type, debouncedV, id, value, disabled, setSearchFilter, startTransition])

  return (
    <div className='flex flex-col gap-1'>
      <Label htmlFor={type} className='capitalize'>{type}:</Label>
      <Input
        id={type}
        type="number"
        disabled={disabled}
        value={selectedV ?? ""}
        onChange={(e) => {
          if (e.target.value === "") setSelectedV(null);
          else setSelectedV(Number(e.target.value));
        }}
        onKeyDown={(e) => e.stopPropagation()}
        className='px-2 max-w-24'
      />
    </div>
  )
}

function ElementInput({
  id,
  value,
  isPending,
  startTransition
}: {
  id: string,
  value: ElementsSearchSchema["element"],
  isPending?: boolean,
  startTransition: React.TransitionStartFunction
}) {
  const [openPopover, setOpenPopover] = React.useState(false)

  const [element, setEllement] = React.useState<ELEMENTS | null>(value)

  const [, setSearchFilter] = useMapItemsSearch()

  React.useEffect(() => {
    if (!!element && element !== value) startTransition(async () => {
      await setSearchFilter(old => {
        if (!old.elements) return {
          ...old,
          elements: [{
            id: uuidv4(),
            element,
            max: null,
            min: null,
          }]
        };
        return {
          ...old,
          elements: old.elements.map(item => {
            if (item.id !== id) return item;
            return {
              ...item,
              element
            }
          })
        }
      })
    })
  }, [element, value, id, setSearchFilter, startTransition])

  return (
    <div className='flex flex-col gap-1'>
      <Label htmlFor='select-element'>Элемент:</Label>
      <Popover open={openPopover} onOpenChange={setOpenPopover}>
        <PopoverTrigger asChild>
          <Button
            id='select-element'
            variant="outline"
            role="combobox"
            aria-expanded={openPopover}
            className="w-24 justify-between truncate p-2 gap-1"
          >
            <p className='truncate'>{idToSentenceCase(element ?? "")}</p>
            <ChevronsUpDownIcon size={16} className="opacity-50 flex-none" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-32 p-0">
          <Command className='relative'>
            <CommandInput placeholder="Поиск..." className='w-5/6' disabled={isPending} />
            {isPending && <Loader className="absolute top-3 right-6 size-4 animate-spin text-muted-foreground z-10" />}
            <CommandList>
              <CommandEmpty>Не найдено.</CommandEmpty>
              <CommandGroup>
                {Object.values(ELEMENTS).map((item) => (
                  <CommandItem
                    key={item}
                    value={item}
                    disabled={isPending}
                    onSelect={(value) => setEllement(value as ELEMENTS)}
                  >
                    <span className="truncate">
                      {idToSentenceCase(item)}
                    </span>
                    <Check
                      className={cn(
                        "ml-auto size-4 shrink-0",
                        element === item ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}