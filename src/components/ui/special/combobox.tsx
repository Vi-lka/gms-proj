"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "../popover"
import { Button } from "../button"
import type * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "~/lib/utils"
import { Check, ChevronDown, X } from "lucide-react"
import { type Command as CommandPrimitive } from "cmdk"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../command"
import { Separator } from "../separator"

type ComboboxProps = {
} & React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> 

const Combobox = (props: ComboboxProps) => (
  <Popover {...props} />
)

type ComboboxTriggerExtendT = {
  placeholder?: string, 
  icon?: React.ReactNode,
  selectedValue?: string | null,
  handleClear?: () => void,
}
type ComboboxTriggerT = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> & ComboboxTriggerExtendT;

const ComboboxTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  ComboboxTriggerT
>(({ placeholder = "Выберите...", icon, selectedValue, handleClear, className, children, ...props }, ref) => (
  <PopoverTrigger ref={ref} {...props} asChild>
    <Button
      variant="outline"
      role="combobox"
      className={cn("w-full flex justify-between px-3 whitespace-break-spaces group [&>span]:line-clamp-1", className)}
    >
      {children 
        ? <span>{children}</span> 
        : <span className="text-muted-foreground font-normal">{placeholder}</span>
      }
      <div className="flex items-center justify-between">
        {selectedValue && (
          <>
            <X
              className="h-4 mx-2 cursor-pointer text-muted-foreground hover:text-foreground transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if(handleClear) handleClear();
              }}
            />
            <Separator
              orientation="vertical"
              className="flex min-h-6 h-full group-hover:bg-muted-foreground/20"
            />
          </>
        )}
        {icon !== undefined
          ? icon
          : <ChevronDown className="ml-2 h-4 w-4 flex-none shrink-0 text-muted-foreground" />
        }
      </div>
    </Button>
  </PopoverTrigger>
))
ComboboxTrigger.displayName = "ComboboxTrigger"

type ComboboxContentExtendT = {
  placeholder?: string,
  emptyMessage?: string,
}
type ComboboxContentT = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & ComboboxContentExtendT

const ComboboxContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  ComboboxContentT
>(({ placeholder = "Поиск...", emptyMessage = "Не найдено.", className, children, ...props }, ref) => (
  <PopoverContent 
    ref={ref}
    className={cn("w-[--radix-popover-trigger-width] p-0", className)}
    {...props}
  >
    <Command>
      <CommandInput placeholder={placeholder}/>
      <CommandList>
        <CommandEmpty>{emptyMessage}</CommandEmpty>
        {children}
      </CommandList>
    </Command>
  </PopoverContent>
))
ComboboxContent.displayName = "ComboboxContent"

const ComboboxGroup = CommandGroup

type ComboboxItemExtendT = {
  selectedValue: string | undefined
}

type ComboboxItemT = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & ComboboxItemExtendT

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  ComboboxItemT
>(({ children, value, selectedValue, ...props }, ref) => (
  <CommandItem 
    ref={ref} 
    value={value}
    {...props}
  >
    <Check
      className={cn(
        "mr-2 h-4 w-4 flex-none shrink-0",
        value === selectedValue ? "opacity-100" : "opacity-0"
      )}
    />
    {children}
  </CommandItem>
))
ComboboxItem.displayName = "ComboboxItem"

export {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxGroup,
  ComboboxItem
}