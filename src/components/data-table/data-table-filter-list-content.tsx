import { type Table } from '@tanstack/react-table'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import React from 'react'
import { getFiltersStateParser } from '~/lib/parsers'
import type { JoinOperator, DataTableAdvancedFilterField, Filter, StringKeyOf, FilterOperator } from '~/lib/types'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { SortableDragHandle, SortableItem } from '../ui/sortable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { cn, idToSentenceCase } from '~/lib/utils'
import { dataTableConfig } from '~/lib/config/data-table'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Check, ChevronsUpDown, GripVertical, Trash2 } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'
import { useDebouncedCallback } from '~/hooks/use-debounced-callback'
import { getDefaultFilterOperator, getFilterOperators } from '~/lib/data-table-func'
import { customAlphabet } from 'nanoid'
import RenderFilterInput from './render-filter-input'

interface DataTableFilterListContent<TData> {
  table: Table<TData>
  filterFields: DataTableAdvancedFilterField<TData>[]
  setDragEnabled?: React.Dispatch<React.SetStateAction<boolean | undefined>>
  debounceMs?: number,
  shallow?: boolean,
}

export default function DataTableFilterListContent<TData>({
  table,
  filterFields,
  setDragEnabled,
  debounceMs = 300,
  shallow = false,
}: DataTableFilterListContent<TData>) {
  const id = React.useId()
  const [filters, setFilters] = useQueryState(
    "filters",
    getFiltersStateParser(table.getRowModel().rows[0]?.original)
      .withDefault([])
      .withOptions({
        clearOnDefault: true,
        shallow,
      })
  )

  const [joinOperator, setJoinOperator] = useQueryState(
    "joinOperator",
    parseAsStringEnum(["and", "or"]).withDefault("and").withOptions({
      clearOnDefault: true,
      shallow,
    })
  )

  const debouncedSetFilters = useDebouncedCallback(setFilters, debounceMs)

  function updateFilter({
    rowId,
    field,
    debounced = false,
  }: {
    rowId: string
    field: Omit<Partial<Filter<TData>>, "rowId">
    debounced?: boolean
  }) {
    const updateFunction = debounced ? debouncedSetFilters : setFilters
    updateFunction((prevFilters) => {
      const updatedFilters = prevFilters.map((filter) => {
        if (filter.rowId === rowId) {
          return { ...filter, ...field }
        }
        return filter
      })
      return updatedFilters
    })
  }

  function addFilter() {
    const filterField = filterFields[0]

    if (!filterField) return

    void setFilters([
      ...filters,
      {
        id: filterField.id,
        value: "",
        type: filterField.type,
        operator: getDefaultFilterOperator(filterField.type),
        rowId: customAlphabet(
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
          6
        )(),
      },
    ])
  }

  function removeFilter(rowId: string) {
    const updatedFilters = filters.filter((filter) => filter.rowId !== rowId)
    void setFilters(updatedFilters)
  }


  return (
    <>
      {filters.length > 0 ? (
        <h4 className="font-medium leading-none">Фильтры</h4>
      ) : (
        <div className="flex flex-col gap-1">
          <h4 className="font-medium leading-none">Фильтры не применены</h4>
          <p className="text-sm text-muted-foreground">
            Добавьте фильтры, чтобы уточнить результаты.
          </p>
        </div>
      )}
      <ScrollArea type="always" className="pb-2 pr-2" classNameViewport="max-h-40" classNameBar="z-50">
        <div className="flex flex-col gap-2 py-0.5">
          {filters.map((filter, index) => {
            const filterId = `${id}-filter-${filter.rowId}`
            const joinOperatorListboxId = `${filterId}-join-operator-listbox`
            const fieldListboxId = `${filterId}-field-listbox`
            const fieldTriggerId = `${filterId}-field-trigger`
            const operatorListboxId = `${filterId}-operator-listbox`
            const inputId = `${filterId}-input`
          
            return (
              <SortableItem 
                key={filter.rowId} 
                value={filter.rowId} 
                asChild
              >
                <div className="flex items-center gap-1">
                  <div className="min-w-[4.5rem] px-0.5 text-center">
                    {index === 0 ? (
                      <span className="text-sm text-muted-foreground">
                        Где
                      </span>
                    ) : index === 1 ? (
                      <Select
                        value={joinOperator}
                        onValueChange={(value: JoinOperator) =>
                          setJoinOperator(value)
                        }
                      >
                        <SelectTrigger
                          aria-label="Select join operator"
                          aria-controls={joinOperatorListboxId}
                          className="h-8 rounded lowercase"
                        >
                          <SelectValue placeholder={idToSentenceCase(joinOperator)} />
                        </SelectTrigger>
                        <SelectContent
                          id={joinOperatorListboxId}
                          position="popper"
                          className="min-w-[var(--radix-select-trigger-width)] lowercase"
                        >
                          {dataTableConfig.joinOperators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {idToSentenceCase(joinOperator)}
                      </span>
                    )}
                  </div>
                  <Popover modal>
                    <PopoverTrigger asChild>
                      <Button
                        id={fieldTriggerId}
                        variant="outline"
                        size="sm"
                        role="combobox"
                        aria-label="Select filter field"
                        aria-controls={fieldListboxId}
                        className="h-8 w-32 justify-between gap-2 rounded focus:outline-none focus:ring-1 focus:ring-ring focus-visible:ring-0"
                      >
                        <span className="truncate">
                          {filterFields.find(
                            (field) => field.id === filter.id
                          )?.label ?? "Выберите поле"}
                        </span>
                        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      id={fieldListboxId}
                      align="start"
                      className="w-fit max-w-80 p-0"
                      onCloseAutoFocus={() =>
                        document.getElementById(fieldTriggerId)?.focus({
                          preventScroll: true,
                        })
                      }
                    >
                      <Command>
                        <CommandInput placeholder="Поиск полей..." />
                        <CommandList>
                          <CommandEmpty>Поля не найдены.</CommandEmpty>
                          <CommandGroup>
                            {filterFields.map((field) => (
                              <CommandItem
                                key={field.id}
                                value={field.id}
                                onSelect={(value) => {
                                  const filterField = filterFields.find(
                                    (col) => col.id === value
                                  )
                                
                                  if (!filterField) return
                                
                                  updateFilter({
                                    rowId: filter.rowId,
                                    field: {
                                      id: value as StringKeyOf<TData>,
                                      type: filterField.type,
                                      operator: getDefaultFilterOperator(
                                        filterField.type
                                      ),
                                      value: "",
                                    },
                                  })
                                
                                  document
                                    .getElementById(fieldTriggerId)
                                    ?.click()
                                }}
                              >
                                <span className="mr-1.5 truncate">
                                  {field.label}
                                </span>
                                <Check
                                  className={cn(
                                    "ml-auto size-4 shrink-0",
                                    field.id === filter.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Select
                    value={filter.operator}
                    onValueChange={(value: FilterOperator) =>
                      updateFilter({
                        rowId: filter.rowId,
                        field: {
                          operator: value,
                          value:
                            value === "isEmpty" || value === "isNotEmpty"
                              ? ""
                              : filter.value,
                        },
                      })
                    }
                  >
                    <SelectTrigger
                      aria-label="Select filter operator"
                      aria-controls={operatorListboxId}
                      className="h-8 w-32 rounded"
                    >
                      <div className="truncate">
                        <SelectValue placeholder={filter.operator} />
                      </div>
                    </SelectTrigger>
                    <SelectContent id={operatorListboxId}>
                      {getFilterOperators(filter.type).map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="w-36 flex-1">
                    <RenderFilterInput 
                      filter={filter} 
                      inputId={inputId} 
                      filterFields={filterFields} 
                      table={table}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Remove filter ${index + 1}`}
                    className="size-8 shrink-0 rounded"
                    onClick={() => removeFilter(filter.rowId)}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                  <SortableDragHandle
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0 rounded"
                    onPointerDown={() => setDragEnabled?.(false)}
                    onPointerUp={() => setDragEnabled?.(true)}
                    onMouseLeave={() => setDragEnabled?.(true)}
                  >
                    <GripVertical className="size-3.5" aria-hidden="true" />
                  </SortableDragHandle>
                </div>
              </SortableItem>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" className="z-50" />
      </ScrollArea>
      <div className="flex w-full items-center gap-2">
        <Button
          size="sm"
          className="h-[1.85rem] rounded"
          onClick={addFilter}
        >
          Добавить
        </Button>
        {filters.length > 0 ? (
          <Button
            size="sm"
            variant="outline"
            className="rounded"
            onClick={() => {
              void setFilters(null)
              void setJoinOperator("and")
            }}
          >
            Сбросить
          </Button>
        ) : null}
      </div>
    </>
  )
}
