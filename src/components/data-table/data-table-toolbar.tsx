"use client"

import * as React from "react"
import type { DataTableFilterField } from "~/lib/types"
import type { Table } from "@tanstack/react-table"
import { Loader, X } from "lucide-react"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { DataTableFacetedFilter } from "~/components/data-table/data-table-faceted-filter"
import { DataTableViewOptions } from "~/components/data-table/data-table-view-options"
import DataTableSearchInput from "./data-table-search-input"

interface DataTableToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>
  /**
   * An array of filter field configurations for the data table.
   * When options are provided, a faceted filter is rendered.
   * Otherwise, a search filter is rendered.
   *
   * @example
   * const filterFields = [
   *   {
   *     id: 'name',
   *     label: 'Name',
   *     placeholder: 'Filter by name...'
   *   },
   *   {
   *     id: 'status',
   *     label: 'Status',
   *     options: [
   *       { label: 'Active', value: 'active', icon: ActiveIcon, count: 10 },
   *       { label: 'Inactive', value: 'inactive', icon: InactiveIcon, count: 5 }
   *     ]
   *   }
   * ]
   */
  filterFields?: DataTableFilterField<TData>[]

  isPending?: boolean
}

export function DataTableToolbar<TData>({
  table,
  filterFields = [],
  isPending,
  children,
  className,
  ...props
}: DataTableToolbarProps<TData>) {
  const isFiltered = (table.getState().columnFilters.length > 0)

  // Memoize computation of searchableColumns and filterableColumns
  const { searchableColumns, filterableColumns } = React.useMemo(() => {
    return {
      searchableColumns: filterFields.filter((field) => !field.options),
      filterableColumns: filterFields.filter((field) => field.options),
    }
  }, [filterFields])

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2 overflow-auto p-1",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-2">
        {searchableColumns.length > 0 &&
          searchableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : "") && (
                <DataTableSearchInput
                  key={String(column.id)}
                  table={table}
                  columnId={column.id}
                  placeholder={column.placeholder}
                />
              )
          )}
        {filterableColumns.length > 0 &&
          filterableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : "") && (
                <DataTableFacetedFilter
                  key={String(column.id)}
                  column={table.getColumn(column.id ? String(column.id) : "")}
                  title={column.label}
                  disabled={column.disabled}
                  options={column.options ?? []}
                />
              )
          )}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={() => table.resetColumnFilters()}
          >
            Сброс
            <X className="ml-2 size-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isPending && (
          <div className='flex items-center gap-1 mx-2'>
            <Loader size={18} className="flex-none animate-spin" />
            <span className='text-sm font-light md:block hidden'>Загрузка...</span>
          </div>
        )}
        {children}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
