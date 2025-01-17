import React from 'react'
import { type FieldValues, type Path, type UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/utils'

export default function NumberField<TData extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  disabled,
  className
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TData, any, undefined>,
  name: Path<TData>,
  label?: React.ReactNode,
  placeholder?: string,
  disabled?: boolean,
  className?: string,
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: {value, onChange, ...other} }) => (
        <FormItem className={cn("max-w-28", className)}>
          <FormLabel>{label}</FormLabel>
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
  )
}
