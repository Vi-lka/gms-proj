import React from 'react'
import { type Path, type UseFormReturn, type FieldValues } from 'react-hook-form'
import useSWR from 'swr';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Skeleton } from '~/components/ui/skeleton';
import { errorToast } from '~/components/ui/special/error-toast';
import { MultiSelect } from '~/components/ui/special/multi-select';
import { cn } from '~/lib/utils';
import { getApiRoute, type FieldsSearchParamsT } from '~/lib/validations/api-routes'
import { type FieldExtend } from '~/server/db/schema';

export default function FieldsSelect<TData extends FieldValues>({
  form,
  name,
  label,
  placeholder = "Выберите Месторождения...",
  searchParams,
  // eslint-disable-next-line @typescript-eslint/unbound-method
  onOpenChange,
  className
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TData, any, undefined>,
  name: Path<TData>,
  label?: React.ReactNode,
  placeholder?: string,
  searchParams?: FieldsSearchParamsT,
  onOpenChange?(open: boolean): void,
  className?: string,
}) {
  const { data, error, isLoading } = useSWR<FieldExtend[], Error>(
    getApiRoute({
      route: "fields", 
      searchParams
    })
  );

  if (isLoading) return <Skeleton className='rounded-xl border-border shadow-sm h-9 w-full'/>
  if (error) {
    errorToast(error.message)
    return null;
  }
  if (!data) return null

  const dataForField = data.map(item => {
    return {value: item.id, label: item.name, description: `(${item.companyName})`}
  })

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("", className)}>
          <FormLabel>{label}</FormLabel>
            <FormControl>
              <MultiSelect
                options={dataForField}
                onValueChange={field.onChange}
                onOpenChange={onOpenChange}
                defaultValue={field.value}
                placeholder={placeholder}
                variant='inverted'
                modalPopover
                maxCount={1}
              />
            </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
