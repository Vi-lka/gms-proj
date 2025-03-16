"use client"

import * as React from "react"
import { type Table } from "@tanstack/react-table"

import { cn } from "~/lib/utils"
import { DataTableFilterList } from "~/components/data-table/data-table-filter-list"
import { DataTableSortList } from "~/components/data-table/data-table-sort-list"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import { type DataTableAdvancedFilterField } from "~/lib/types"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { Loader } from "lucide-react"

interface DataTableAdvancedToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type Table<TData>
   */
  table: Table<TData>

  /**
   * An array of filter field configurations for the data table.
   * @type DataTableAdvancedFilterField<TData>[]
   * @example
   * const filterFields = [
   *   {
   *     id: 'name',
   *     label: 'Name',
   *     type: 'text',
   *     placeholder: 'Filter by name...'
   *   },
   *   {
   *     id: 'status',
   *     label: 'Status',
   *     type: 'select',
   *     options: [
   *       { label: 'Active', value: 'active', count: 10 },
   *       { label: 'Inactive', value: 'inactive', count: 5 }
   *     ]
   *   }
   * ]
   */
  filterFields: DataTableAdvancedFilterField<TData>[]

  /**
   * Debounce time (ms) for filter updates to enhance performance during rapid input.
   * @default 300
   */
  debounceMs?: number

  /**
   * Shallow mode keeps query states client-side, avoiding server calls.
   * Setting to `false` triggers a network request with the updated querystring.
   * @default true
   */
  shallow?: boolean

  prepend?: React.ReactNode

  append?: React.ReactNode

  disabled?: boolean

  isPending?: boolean

  draggableList?: boolean
}

export function DataTableAdvancedToolbar<TData>({
  table,
  filterFields = [],
  debounceMs = 300,
  shallow = true,
  disabled,
  isPending,
  children,
  prepend,
  append,
  draggableList,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  return (
    <ScrollArea type="always" className="pb-2" classNameViewport="max-h-12" classNameBar="z-50">
      <div
        className={cn(
          "flex w-full items-center justify-between gap-2 overflow-auto p-1",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2">
          {prepend}
          <DataTableFilterList
            table={table}
            filterFields={filterFields}
            debounceMs={debounceMs}
            shallow={shallow}
            draggable={draggableList}
          />
          {append}
        </div>
        <div className="flex items-center gap-2">
          {isPending && (
            <div className='flex items-center gap-1 mx-2'>
              <Loader size={18} className="flex-none animate-spin" />
              <span className='text-sm font-light md:block hidden'>Загрузка...</span>
            </div>
          )}
          {children}
          <DataTableSortList
            table={table}
            debounceMs={debounceMs}
            shallow={shallow}
            disabled={disabled}
          />
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <ScrollBar orientation="horizontal" className="z-50" />
    </ScrollArea>
  )
}
