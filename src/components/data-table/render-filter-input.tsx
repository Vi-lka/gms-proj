import React from 'react'
import { type DataTableAdvancedFilterField, type Filter } from '~/lib/types'
import { Input } from '../ui/input'
import { useQueryState } from 'nuqs'
import { getFiltersStateParser } from '~/lib/parsers'
import { type Table } from '@tanstack/react-table'
import { useDebouncedCallback } from '~/hooks/use-debounced-callback'
import { 
  FacetedFilter, 
  FacetedFilterContent, 
  FacetedFilterEmpty, 
  FacetedFilterGroup, 
  FacetedFilterInput, 
  FacetedFilterItem, 
  FacetedFilterList, 
  FacetedFilterTrigger 
} from '../ui/faceted-filter'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { CalendarIcon, ChevronsUpDown } from 'lucide-react'
import { cn, formatDate } from '~/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar } from '../ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface RenderFilterInputProps<TData> {
  filter: Filter<TData>
  inputId: string
  filterFields: DataTableAdvancedFilterField<TData>[]
  table: Table<TData>
  debounceMs?: number
  shallow?: boolean
}

export default function RenderFilterInput<TData>({
  filter,
  inputId,
  filterFields,
  table,
  debounceMs = 300,
  shallow = false,
}: RenderFilterInputProps<TData>) {
  const [, setFilters] = useQueryState(
    "filters",
    getFiltersStateParser(table.getRowModel().rows[0]?.original)
      .withDefault([])
      .withOptions({
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

  const filterField = filterFields.find((f) => f.id === filter.id)

  if (!filterField) return null

  if (filter.operator === "isEmpty" || filter.operator === "isNotEmpty") {
    return (
      <div
        id={inputId}
        role="status"
        aria-live="polite"
        aria-label={`${filterField.label} filter is ${filter.operator === "isEmpty" ? "empty" : "not empty"}`}
        className="h-8 w-full rounded border border-dashed"
      />
    )
  }

  switch (filter.type) {
    case "text":
    case "number":
      return (
        <Input
          id={inputId}
          type={filter.type}
          aria-label={`${filterField.label} filter value`}
          aria-describedby={`${inputId}-description`}
          placeholder={filterField.placeholder ?? "Введите..."}
          className="h-8 w-full rounded"
          defaultValue={
            typeof filter.value === "string" ? filter.value : undefined
          }
          onChange={(event) =>
            updateFilter({
              rowId: filter.rowId,
              field: { value: event.target.value },
              debounced: true,
            })
          }
        />
      )
    case "select":
      return (
        <FacetedFilter>
          <FacetedFilterTrigger asChild>
            <Button
              id={inputId}
              variant="outline"
              size="sm"
              aria-label={`${filterField.label} filter value`}
              aria-controls={`${inputId}-listbox`}
              className="h-8 w-full justify-start gap-2 rounded px-1.5 text-left text-muted-foreground hover:text-muted-foreground"
            >
              {filter.value && typeof filter.value === "string" ? (
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {filterField?.options?.find((option) => option.value === filter.value)?.label 
                  ?? filter.value}
                </Badge>
              ) : (
                <>
                  {filterField.placeholder ?? "Выберите..."}
                  <ChevronsUpDown className="size-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </FacetedFilterTrigger>
          <FacetedFilterContent
            id={`${inputId}-listbox`}
            className="w-[12.5rem] origin-[var(--radix-popover-content-transform-origin)]"
          >
            <FacetedFilterInput
              placeholder={filterField?.label ?? "Выберите..."}
              aria-label={`Search ${filterField?.label} options`}
            />
            <FacetedFilterList>
              <FacetedFilterEmpty>Не найдено.</FacetedFilterEmpty>
              <FacetedFilterGroup>
                {filterField?.options?.map((option) => (
                  <FacetedFilterItem
                    key={option.value}
                    value={option.value}
                    selected={filter.value === option.value}
                    onSelect={(value) => {
                      updateFilter({ rowId: filter.rowId, field: { value } })
                      setTimeout(() => {
                        document.getElementById(inputId)?.click()
                      }, 0)
                    }}
                  >
                    {option.icon && (
                      <option.icon
                        className="mr-2 size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span>{option.label}</span>
                    {option.count && (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {option.count}
                      </span>
                    )}
                  </FacetedFilterItem>
                ))}
              </FacetedFilterGroup>
            </FacetedFilterList>
          </FacetedFilterContent>
        </FacetedFilter>
      )
    case "multi-select":
      const selectedValues = new Set(
        Array.isArray(filter.value) ? filter.value : []
      )

      return (
        <FacetedFilter>
          <FacetedFilterTrigger asChild>
            <Button
              id={inputId}
              variant="outline"
              size="sm"
              aria-label={`${filterField.label} filter values`}
              aria-controls={`${inputId}-listbox`}
              className="h-8 w-full justify-start gap-2 rounded px-1.5 text-left text-muted-foreground hover:text-muted-foreground"
            >
              <>
                {selectedValues.size === 0 && (
                  <>
                    {filterField.placeholder ?? " Выберите..."}
                    <ChevronsUpDown className="size-4" aria-hidden="true" />
                  </>
                )}
              </>
              {selectedValues?.size > 0 && (
                <div className="flex items-center">
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal lg:hidden"
                  >
                    {selectedValues.size}
                  </Badge>
                  <div className="hidden min-w-0 gap-1 lg:flex">
                    {selectedValues.size > 2 ? (
                      <Badge
                        variant="secondary"
                        className="rounded-sm px-1 font-normal"
                      >
                        {selectedValues.size} выбрано
                      </Badge>
                    ) : (
                      filterField?.options
                        ?.filter((option) => selectedValues.has(option.value))
                        .map((option) => (
                          <Badge
                            variant="secondary"
                            key={option.value}
                            className="truncate rounded-sm px-1 font-normal"
                          >
                            {option.label}
                          </Badge>
                        ))
                    )}
                  </div>
                </div>
              )}
            </Button>
          </FacetedFilterTrigger>
          <FacetedFilterContent
            id={`${inputId}-listbox`}
            className="w-[12.5rem] origin-[var(--radix-popover-content-transform-origin)]"
          >
            <FacetedFilterInput
              aria-label={`Search ${filterField?.label} options`}
              placeholder={filterField?.label ?? "Поиск..."}
            />
            <FacetedFilterList>
              <FacetedFilterEmpty>Не найдено.</FacetedFilterEmpty>
              <FacetedFilterGroup>
                {filterField?.options?.map((option) => (
                  <FacetedFilterItem
                    key={option.value}
                    value={option.value}
                    selected={selectedValues.has(option.value)}
                    onSelect={(value) => {
                      const currentValue = Array.isArray(filter.value)
                        ? filter.value
                        : []
                      const newValue = currentValue.includes(value)
                        ? currentValue.filter((v) => v !== value)
                        : [...currentValue, value]
                      updateFilter({
                        rowId: filter.rowId,
                        field: { value: newValue },
                      })
                    }}
                  >
                    {option.icon && (
                      <option.icon
                        className="mr-2 size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span>{option.label}</span>
                    {option.count && (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {option.count}
                      </span>
                    )}
                  </FacetedFilterItem>
                ))}
              </FacetedFilterGroup>
            </FacetedFilterList>
          </FacetedFilterContent>
        </FacetedFilter>
      )
    case "date":
      const dateValue = Array.isArray(filter.value)
        ? filter.value.filter(Boolean)
        : [filter.value, filter.value].filter(Boolean)

      const displayValue =
        filter.operator === "isBetween" && dateValue.length === 2
          ? `${formatDate(dateValue[0] ?? new Date())} - ${formatDate(
              dateValue[1] ?? new Date()
            )}`
          : dateValue[0]
            ? formatDate(dateValue[0])
            : "Выберите дату"

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id={inputId}
              variant="outline"
              size="sm"
              aria-label={`${filterField.label} date filter`}
              aria-controls={`${inputId}-calendar`}
              className={cn(
                "h-8 w-full justify-start gap-2 rounded text-left font-normal",
                !filter.value && "text-muted-foreground"
              )}
            >
              <CalendarIcon
                className="size-3.5 shrink-0"
                aria-hidden="true"
              />
              <span className="truncate">{displayValue}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            id={`${inputId}-calendar`}
            align="start"
            className="w-auto p-0"
          >
            {filter.operator === "isBetween" ? (
              <Calendar
                id={`${inputId}-calendar`}
                mode="range"
                aria-label={`Select ${filterField.label} date range`}
                selected={
                  dateValue.length === 2
                    ? {
                        from: new Date(dateValue[0] ?? ""),
                        to: new Date(dateValue[1] ?? ""),
                      }
                    : {
                        from: new Date(),
                        to: new Date(),
                      }
                }
                onSelect={(date) => {
                  updateFilter({
                    rowId: filter.rowId,
                    field: {
                      value: date
                        ? [
                            date.from?.toISOString() ?? "",
                            date.to?.toISOString() ?? "",
                          ]
                        : [],
                    },
                  })
                }}
                initialFocus
                numberOfMonths={1}
              />
            ) : (
              <Calendar
                id={`${inputId}-calendar`}
                mode="single"
                aria-label={`Select ${filterField.label} date`}
                selected={dateValue[0] ? new Date(dateValue[0]) : undefined}
                onSelect={(date) => {
                  updateFilter({
                    rowId: filter.rowId,
                    field: { value: date?.toISOString() ?? "" },
                  })

                  setTimeout(() => {
                    document.getElementById(inputId)?.click()
                  }, 0)
                }}
                initialFocus
              />
            )}
          </PopoverContent>
        </Popover>
      )
    case "boolean": {
      if (Array.isArray(filter.value)) return null

      return (
        <Select
          value={filter.value}
          onValueChange={(value) =>
            updateFilter({ rowId: filter.rowId, field: { value } })
          }
        >
          <SelectTrigger
            id={inputId}
            aria-label={`${filterField.label} boolean filter`}
            aria-controls={`${inputId}-listbox`}
            className="h-8 w-full rounded bg-transparent"
          >
            <SelectValue placeholder={filter.value ? "True" : "False"} />
          </SelectTrigger>
          <SelectContent id={`${inputId}-listbox`}>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      )
    }
    default:
      return null
  }
}
