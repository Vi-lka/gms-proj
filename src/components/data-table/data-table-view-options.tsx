"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"
import { Check, ChevronsUpDown, Settings2 } from "lucide-react"

import { cn, idToSentenceCase } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          aria-label="Toggle columns"
          variant="outline"
          role="combobox"
          size="sm"
          className="ml-auto h-8 gap-2 focus:outline-none focus:ring-1 focus:ring-ring focus-visible:ring-0 flex"
        >
          <Settings2 className="size-4" />
          Вид
          <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-44 p-0"
        onCloseAutoFocus={() => triggerRef.current?.focus()}
      >
        <Command>
          <CommandInput placeholder="Поиск столбца..." />
          <CommandList>
            <CommandEmpty>Столбцы не найдены.</CommandEmpty>
            <CommandGroup>
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <CommandItem
                      key={column.id}
                      onSelect={() =>
                        column.toggleVisibility(!column.getIsVisible())
                      }
                    >
                      <span className="truncate">
                        {idToSentenceCase(column.id)}
                      </span>
                      <Check
                        className={cn(
                          "ml-auto size-4 shrink-0",
                          column.getIsVisible() ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  )
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
