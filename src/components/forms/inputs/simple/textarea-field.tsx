import React from 'react'
import { type FieldValues, type Path, type UseFormReturn } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'

export default function TextareaField<TData extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  className,
  classNameInput
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TData, any, undefined>,
  name: Path<TData>,
  label?: React.ReactNode,
  placeholder?: string,
  className?: string,
  classNameInput?: string,
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: {value, ...other} }) => (
        <FormItem className={cn("", className)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              value={value ?? ""}
              className={classNameInput}
              {...other}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
