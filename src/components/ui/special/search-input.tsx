"use client"

import React from 'react'
import { cn } from '~/lib/utils'
import { useDebounce } from '~/hooks/use-debounce'
import { Loader, XIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { Input } from '../input'
import { Button } from '../button'

interface SearchInputProps {
  isPending: boolean
  startTransition: React.TransitionStartFunction
  placeholder?: string,
  disabled?: boolean
  className?: string,
}

export default function SearchInput({
  isPending,
  startTransition,
  placeholder,
  disabled,
  className,
}: SearchInputProps) {
  const [search, setSearch] = useQueryState('search', {shallow: false, defaultValue: ""})

  const [searchValue, setSearchValue] = React.useState(search ?? "")
  const debouncedValue = useDebounce(searchValue, 300)

  React.useEffect(() => {
    if (search === null) setSearchValue("")
  }, [search])

  React.useEffect(() => {
    startTransition(async () => {
      await setSearch(debouncedValue)
    })
  }, [debouncedValue, setSearch, startTransition])

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
          className='absolute right-0 top-1/2 -translate-y-1/2 w-fit h-fit p-2 text-muted-foreground z-10'
          onClick={() => {
            setSearchValue("")
          }}
        >
          <XIcon size={14} />
        </Button>
      )}
      {isPending && (
        <div className='w-7 h-7 bg-muted flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 p-4 rounded-md z-20'>
          <Loader size={18} className='flex-none animate-spin text-muted-foreground' />
        </div>
      )}
    </div>
  )
}