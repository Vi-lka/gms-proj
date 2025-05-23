import React from 'react'
import { Input } from '../ui/input'
import type { Table } from "@tanstack/react-table"
import { cn } from '~/lib/utils'
import { useDebounce } from '~/hooks/use-debounce'
import { useSearchParams } from 'next/navigation'
import { XIcon } from 'lucide-react'
import { Button } from '../ui/button'


interface DataTableSearchInputProps<TData> {
  table: Table<TData>,
  columnId: Extract<keyof TData, string>,
  placeholder?: string,
  disabled?: boolean
  className?: string,
}


export default function DataTableSearchInput<TData>({
  table,
  columnId,
  placeholder,
  disabled,
  className,
}: DataTableSearchInputProps<TData>) {
  const searchParams = useSearchParams();

  const search = searchParams.get(String(columnId))

  const [searchValue, setSearchValue] = React.useState(search ?? "")
  const debouncedValue = useDebounce(searchValue, 500)

  React.useEffect(() => {
    if (search === null) setSearchValue("")
  }, [search])

  React.useEffect(() => {
    table.getColumn(String(columnId))?.setFilterValue(debouncedValue)
  }, [table, columnId, debouncedValue])

  return (
    <div className='relative'>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        disabled={disabled}
        className={cn("h-8 w-40 lg:w-64 pr-7", className)}
      />
      {searchValue.length > 0 && (
        <Button
          variant="ghost"
          className='absolute right-0 top-1/2 -translate-y-1/2 w-fit h-fit p-2 text-muted-foreground'
          onClick={() => setSearchValue("")}
        >
          <XIcon size={14} />
        </Button>
      )}
    </div>
  )
}