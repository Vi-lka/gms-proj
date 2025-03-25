import { type Table } from '@tanstack/react-table'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import React from 'react'
import { getFiltersStateParser } from '~/lib/parsers'
import { Button } from '../ui/button'
import { X } from 'lucide-react'
import { cn } from '~/lib/utils'

interface CleareAdvancedToolbarButton<TData>
  extends React.HTMLAttributes<HTMLButtonElement> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type Table<TData>
   */
  table: Table<TData>

  /**
   * Shallow mode keeps query states client-side, avoiding server calls.
   * Setting to `false` triggers a network request with the updated querystring.
   * @default true
   */
  shallow?: boolean
}


export default function CleareAdvancedToolbarButton<TData>({
  table,
  shallow = true,
  className,
  ...props
}: CleareAdvancedToolbarButton<TData>) {
  const isFiltered = (table.getState().columnFilters.length > 0)

  const [filters, setFilters] = useQueryState(
    "filters",
    getFiltersStateParser(table.getRowModel().rows[0]?.original)
      .withDefault([])
      .withOptions({
        clearOnDefault: true,
        shallow,
      })
  )
  const [, setJoinOperator] = useQueryState(
    "joinOperator",
    parseAsStringEnum(["and", "or"]).withDefault("and").withOptions({
      clearOnDefault: true,
      shallow,
    })
  )

  if (!isFiltered && filters.length === 0) return null
  
  return (
    <Button
      aria-label="Reset filters"
      variant="ghost"
      className={cn("h-8 px-2 lg:px-3", className)}
      onClick={() => {
        table.resetColumnFilters()
        void setFilters(null)
        void setJoinOperator("and")
      }}
      {...props}
    >
      Сброс
      <X className="ml-2 size-4" />
    </Button>
  )
}
