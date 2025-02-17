"use client"

import React from 'react'
import { toast } from 'sonner';
import useSWR from 'swr';
import { defaultInitState } from '~/components/poly-annotation/store';
import { usePolyStore } from '~/components/poly-annotation/store/poly-store-provider';
import { Skeleton } from '~/components/ui/skeleton';
import { Combobox, ComboboxContent, ComboboxGroup, ComboboxItem, ComboboxTrigger } from '~/components/ui/special/combobox'
import { type FieldsSearchParamsT, getApiRoute } from '~/lib/validations/api-routes';
import { type FieldExtend } from '~/server/db/schema';

export default function SelectField({
  searchParams,
  className,
  onSelect
}: {
  searchParams?: FieldsSearchParamsT
  className?: string,
  onSelect?: ((value: string) => void)
}) {
  const [open, setOpen] = React.useState(false)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {stageConfig, imageConfig, stageRef, ...restDefaultInitState} = defaultInitState

  const fieldId = usePolyStore((state) => state.fieldId)
  const setFieldId = usePolyStore((state) => state.setFieldId)
  const setGlobalState = usePolyStore((state) => state.setGlobalState)

  const { data, error, isLoading } = useSWR<FieldExtend[], Error>(
    getApiRoute({
      route: "fields", 
      searchParams
    })
  );

  if (isLoading) return <Skeleton className='rounded-xl border-border shadow-sm h-9 w-full'/>
  if (error) {
    toast.error(error.message)
    return null;
  }
  if (!data) return null

  const dataForField = data.map(item => {
    return {value: item.id, label: item.name + ` (${item.companyName})`}
  })

  const selected = dataForField.find(item => item.value === fieldId)

  return (
    <Combobox 
      open={open} 
      onOpenChange={(open) => setOpen(open)}
    >
      <ComboboxTrigger 
        placeholder={"Выберите Месторождение"}
        selectedValue={selected?.value}
        handleClear={() => {
          setFieldId(null)
          setGlobalState((prev) => ({
            ...prev,
            ...restDefaultInitState
          }))
        }}
        className={className}
      >
        {selected?.label}
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxGroup>
          {dataForField.map((item) => (
            <ComboboxItem
              key={item.value}
              value={item.label} // for CommandInput
              selectedValue={selected?.label}
              onSelect={() => {
                setOpen(false)
                setGlobalState((prev) => ({
                  ...prev,
                  ...restDefaultInitState,
                  fieldId: item.value
                }))
                onSelect?.(item.value)
              }}
            >
              {item.label}
            </ComboboxItem>
          ))}
        </ComboboxGroup>
      </ComboboxContent>
    </Combobox>
  )
}
