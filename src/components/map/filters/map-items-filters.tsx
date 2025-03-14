"use client"

import { ListFilter, XIcon } from 'lucide-react'
import React from 'react'
import { Button } from '~/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { Portal } from '~/components/ui/portal'
import { cn } from '~/lib/utils'
import ElementsViewFilter from './elements-view-filter'
import SearchFilter from './search-filter'
import ElementsFilter from './elements-filter'
import CompaniesFilter from './companies-filter'
import ClearFiltersButton from './clear-filters-button'

export default function MapItemsFilters() {
  const [open, setOpen] = React.useState(false)

  return (
    <Portal>
      <ClearFiltersButton
        disabled={open}
        className="fixed left-16 ml-1 bottom-6 z-50 p-3 rounded-full aspect-square"
      />
      <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            className={cn(
              "fixed left-6 bottom-6 z-50 w-fit h-fit p-2.5 rounded-full aspect-square",
              "shadow border dark:border-none border-muted-foreground text-foreground hover:text-background",
              "backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary bg-background/60"
            )}
          >
            <ListFilter className='aspect-square'/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className='relative rounded-xl min-w-56'>
          <Button 
            variant="ghost"
            className='absolute w-fit h-fit p-0.5 right-2 top-2 rounded-md'
            onClick={() => setOpen(false)}
          >
            <XIcon size={14} className='text-muted-foreground'/>
          </Button>

          <DropdownMenuLabel>Фильтры</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <SearchFilter />
          <DropdownMenuSeparator />

          <CompaniesFilter />
          <DropdownMenuSeparator />

          <ElementsFilter />
          <DropdownMenuSeparator />

          <ElementsViewFilter />
        </DropdownMenuContent>
      </DropdownMenu>
    </Portal>
  )
}
