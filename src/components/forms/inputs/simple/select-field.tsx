import React from 'react'
import { type Path, type UseFormReturn, type FieldValues, type PathValue } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { cn } from '~/lib/utils'

export default function SelectField<TData extends FieldValues>({
  form,
  name,
  options,
  label,
  placeholder,
  disabled,
  className
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TData, any, undefined>,
  name: Path<TData>,
  options: { value: PathValue<TData, Path<TData>>; label: string }[];
  label?: React.ReactNode,
  placeholder?: string,
  disabled?: boolean,
  className?: string,
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("", className)}>
          <FormLabel>{label}</FormLabel>
          <Select 
            defaultValue={field.value}
            disabled={disabled}
            onValueChange={(value) => {
              form.setValue(
                name, 
                value as PathValue<TData, Path<TData>>,
                {shouldDirty: true, shouldTouch: true, shouldValidate: true}
              )
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map(option => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
