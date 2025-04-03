"use client"

import { useState } from "react";
import { type Path, type UseFormReturn, type FieldValues, type PathValue } from "react-hook-form";
import useSWR from "swr";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Skeleton } from "~/components/ui/skeleton";
import { Combobox, ComboboxContent, ComboboxGroup, ComboboxItem, ComboboxTrigger } from "~/components/ui/special/combobox";
import { errorToast } from "~/components/ui/special/error-toast";
import { cn } from "~/lib/utils";
import { type CompaniesSearchParamsT, getApiRoute } from "~/lib/validations/api-routes";
import { type Company } from "~/server/db/schema";

export default function CompanySelect<TData extends FieldValues>({
  form,
  name,
  handleClear,
  label,
  placeholder = "Выберите Компанию...",
  onOpenChange,
  onSelect,
  searchParams,
  className
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TData, any, undefined>,
  name: Path<TData>,
  handleClear: () => void,
  label?: React.ReactNode,
  placeholder?: string,
  onOpenChange?: (open: boolean) => void,
  onSelect?: ((value: string) => void),
  searchParams?: CompaniesSearchParamsT,
  className?: string,
}) {
  const [open, setOpen] = useState(false)

  const { data, error, isLoading } = useSWR<Company[], Error>(
    getApiRoute({
      route: "companies", 
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
    return {value: item.id, label: item.name}
  })

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("", className)}>
          <FormLabel>{label}</FormLabel>
          <Combobox 
            open={open} 
            modal
            onOpenChange={(open) => {
              setOpen(open)
              if (onOpenChange) onOpenChange(open)
            }}
          >
            <FormControl>
              <ComboboxTrigger 
                ref={field.ref} 
                placeholder={placeholder}
                selectedValue={dataForField.find(item => item.value === field.value)?.value}
                handleClear={handleClear}
              >
                {dataForField.find(item => item.value === field.value)?.label}
              </ComboboxTrigger>
            </FormControl>
            <ComboboxContent>
              <ComboboxGroup>
                {dataForField.map((item) => (
                  <ComboboxItem
                    key={item.value}
                    value={item.label} // for CommandInput
                    selectedValue={dataForField.find(item => item.value === field.value)?.label}
                    onSelect={() => {
                      form.setValue(
                        name, 
                        (item.value === field.value ? "" : item.value) as PathValue<TData, Path<TData>>,
                        {shouldDirty: true, shouldTouch: true, shouldValidate: true}
                      )
                      setOpen(false)
                      if (onSelect) onSelect(item.value === field.value ? "" : item.value)
                    }}
                  >
                    {item.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </ComboboxContent>
          </Combobox>
          <FormMessage />
        </FormItem>
      )}
    />
  )

}