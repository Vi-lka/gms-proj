import React from 'react'
import { type FieldValues, type Path, type UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/utils'

export default function IntervalField<TData extends FieldValues>({
  form,
  nameStart,
  nameEnd,
  label,
  placeholder,
  disabled,
  className
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TData, any, undefined>,
  nameStart: Path<TData>,
  nameEnd: Path<TData>,
  label?: React.ReactNode,
  placeholder?: string,
  disabled?: boolean,
  className?: string,
}) {
  return (
    <div className='space-y-2'>
      <FormLabel className='text-center'>{label}</FormLabel>
      <div className='flex items-center gap-1'>
        <FormField
          control={form.control}
          name={nameStart}
          render={({ field: {value, onChange, ...other} }) => (
            <FormItem className={cn("max-w-16", className)}>
              <FormControl>
                <Input
                  type="number"
                  placeholder={placeholder} 
                  disabled={disabled} 
                  value={value ?? ""}
                  onChange={(e) => {
                    if (e.target.value === "") return onChange(null)
                    return onChange(Number(e.target.value))
                  }}
                  className='px-2'
                  {...other}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <span>-</span>
        <FormField
          control={form.control}
          name={nameEnd}
          render={({ field: {value, onChange, ...other} }) => (
            <FormItem className={cn("max-w-16", className)}>
              <FormControl>
                <Input
                  type="number"
                  placeholder={placeholder} 
                  disabled={disabled} 
                  value={value ?? ""}
                  onChange={(e) => {
                    if (e.target.value === "") return onChange(null)
                    return onChange(Number(e.target.value))
                  }}
                  className='px-2'
                  {...other}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
