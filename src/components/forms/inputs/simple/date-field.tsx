"use client"

import { CalendarIcon } from 'lucide-react';
import React from 'react'
import { type Path, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { Button } from '~/components/ui/button';
import { Calendar } from '~/components/ui/calendar';
import { FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { cn, formatDate } from '~/lib/utils';

export default function DateField<TData extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  fromYear,
  align,
  side,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TData, any, undefined>,
  name: Path<TData>,
  label?: React.ReactNode,
  placeholder?: string,
  fromYear?: number;
  align?: "center" | "end" | "start";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}) {
  const [open, setOpenChange] = React.useState(false);

  const dateNow = new Date();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className="relative space-y-2">
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpenChange}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "flex w-52 truncate justify-start text-left font-normal",
                    className,
                    !field.value && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? (
                    formatDate(field.value)
                  ) : (
                    <span>{placeholder}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
                align={align}
                side={side}
              >
                <Calendar
                  mode="single"
                  timeZone='GMT'
                  selected={field.value}
                  onSelect={(value: Date | undefined) => {
                    field.onChange(value ?? null);
                    setOpenChange(false);
                  }}
                  disabled={(date) => date > dateNow}
                  startMonth={fromYear ? new Date(fromYear, 0) : new Date(1900, 0)}
                  endMonth={dateNow}
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

