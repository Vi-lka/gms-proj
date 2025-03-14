"use client"

import * as React from "react"
import type { DataTableAdvancedFilterField } from "~/lib/types"
import { type Table } from "@tanstack/react-table"
import { GripHorizontal, ListFilter, XIcon } from "lucide-react"
import { useQueryState } from "nuqs"
import { getFiltersStateParser } from "~/lib/parsers"
import { cn } from "~/lib/utils"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Sortable } from "~/components/ui/sortable"
import { Rnd } from "react-rnd"
import { isMobile } from 'react-device-detect';
import DataTableFilterListContent from "./data-table-filter-list-content"
import { PopoverClose } from "@radix-ui/react-popover"

interface DataTableFilterListProps<TData> {
  table: Table<TData>
  filterFields: DataTableAdvancedFilterField<TData>[]
  debounceMs?: number
  shallow?: boolean,
  draggable?: boolean
}

export function DataTableFilterList<TData>({
  table,
  filterFields,
  debounceMs = 300,
  shallow = false,
  draggable
}: DataTableFilterListProps<TData>) {
  const id = React.useId()

  const [dragEnabled, setDragEnabled] = React.useState(draggable)

  const [filters, setFilters] = useQueryState(
    "filters",
    getFiltersStateParser(table.getRowModel().rows[0]?.original)
      .withDefault([])
      .withOptions({
        clearOnDefault: true,
        shallow,
      })
  )

  function moveFilter(activeIndex: number, overIndex: number) {
    void setFilters((prevFilters) => {
      const newFilters = [...prevFilters]
      const [removed] = newFilters.splice(activeIndex, 1)
      if (!removed) return prevFilters
      newFilters.splice(overIndex, 0, removed)
      return newFilters
    })
  }

  const isCanDrag = !!draggable && !isMobile

  return (
    <Sortable
      value={filters.map((item) => ({ id: item.rowId }))}
      onMove={({ activeIndex, overIndex }) => {
        moveFilter(activeIndex, overIndex)
        setDragEnabled(true)
      }}
      overlay={
        <div className="flex items-center gap-1 z-50">
          <div className="h-8 min-w-[4.5rem] rounded-sm bg-primary/10" />
          <div className="h-8 w-32 rounded-sm bg-primary/10" />
          <div className="h-8 w-32 rounded-sm bg-primary/10" />
          <div className="h-8 min-w-36 flex-1 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
        </div>
      }
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label="Open filters"
            aria-controls={`${id}-filter-dialog`}
          >
            <ListFilter className="size-3" aria-hidden="true" />
            Фильтры
            {filters.length > 0 && (
              <Badge
                variant="secondary"
                className="h-[1.14rem] rounded-[0.2rem] px-[0.32rem] font-mono text-[0.65rem] font-normal"
              >
                {filters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          id={`${id}-filter-dialog`}
          align="start"
          collisionPadding={16}
          onInteractOutside={(e) => {
            if (isCanDrag) e.preventDefault();
          }}
          className={cn(
            "relative",
            isCanDrag
            ? "w-0 h-0 p-0 bg-transparent"
            : cn(
                "z-50 flex w-[calc(100vw-theme(spacing.12))] min-w-60 origin-[var(--radix-popover-content-transform-origin)] flex-col p-4 sm:w-[39rem] text-popover-foreground shadow-md outline-none rounded-lg border bg-popover",
                filters.length > 0 ? "gap-3.5" : "gap-2"
              )
          )}
        >
          {isCanDrag
            ? <Rnd 
                disableDragging={!dragEnabled || isMobile} 
                enableResizing={false}
                bounds="body"
              >
                <div className={cn(
                  "relative z-50 flex w-[calc(100vw-theme(spacing.12))] min-w-60 origin-[var(--radix-popover-content-transform-origin)] flex-col p-4 sm:w-[39rem] text-popover-foreground shadow-md outline-none rounded-lg border bg-popover",
                  filters.length > 0 ? "gap-3.5" : "gap-2"
                )}>
                  <GripHorizontal className="absolute size-4 left-1/2 -translate-x-1/2 text-muted-foreground" aria-hidden="true" />
                  <PopoverClose asChild>
                    <Button 
                      variant="ghost"
                      className='absolute w-fit h-fit p-1 right-1 top-1 rounded-md z-20'
                    >
                      <XIcon size={14} className='text-muted-foreground'/>
                    </Button>
                  </PopoverClose>
                  <DataTableFilterListContent
                    table={table}
                    filterFields={filterFields}
                    setDragEnabled={setDragEnabled}
                    debounceMs={debounceMs}
                    shallow={shallow}
                  />
                </div>
              </Rnd>
            : (
              <>
                <PopoverClose asChild>
                  <Button 
                    variant="ghost"
                    className='absolute w-fit h-fit p-1 right-1 top-1 rounded-md z-20'
                  >
                    <XIcon size={14} className='text-muted-foreground'/>
                  </Button>
                </PopoverClose>
                <DataTableFilterListContent
                  table={table}
                  filterFields={filterFields}
                  debounceMs={debounceMs}
                  shallow={shallow}
                />
              </>
            )
          }
        </PopoverContent>
      </Popover>
    </Sortable>
  )
}
