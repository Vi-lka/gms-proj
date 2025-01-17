import { ChevronDown, X } from 'lucide-react'
import React from 'react'
import { type PathValue, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form'
import { Button } from '~/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { type ApproxEnumT } from '~/lib/types'
import { cn } from '~/lib/utils'
import { approxEnum } from '~/server/db/schema'

export default function NumberApproxField<TData extends FieldValues>({
  form,
  name,
  nameApprox,
  label,
  placeholder,
  disabled,
  className
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TData, any, undefined>,
  name: Path<TData>,
  nameApprox: Path<TData>,
  label?: React.ReactNode,
  placeholder?: string,
  disabled?: boolean,
  className?: string,
}) {

  const approxEnums = approxEnum.enumValues

  const defaultPlaceholder = approxEnums.join("|")

  const approxValue = (form.getValues(nameApprox) as ApproxEnumT | null)

  const isApproxValueSelected = (!!approxValue && approxValue.length > 0)

  return (
    <div className='space-y-2'>
      <FormLabel className='text-center'>{label}</FormLabel>
      <div className='flex items-center gap-0.5'>
        <FormField
          control={form.control}
          name={nameApprox}
          render={({ field }) => (
            <FormItem className={"relative w-12"}>
              <Select 
                defaultValue={field.value}
                value={field.value} 
                onValueChange={(value) => {
                  if (!!value) field.onChange(value)
                }} 
              >
                <FormControl>
                  <SelectTrigger
                    icon={
                      isApproxValueSelected
                        ? null
                        : <ChevronDown className="h-4 w-4 opacity-50" />
                    }
                    className='pl-2 pr-1'
                  >
                    <SelectValue placeholder={placeholder ?? defaultPlaceholder} />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {approxEnums.map((value, indx) => (
                    <SelectItem key={indx} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>

                {isApproxValueSelected && (
                  <Button
                    variant="ghost"
                    className='absolute -top-[2px] right-0.5 w-fit h-fit p-1 opacity-50 hover:opacity-100'
                    onClick={() => 
                      form.setValue(
                        nameApprox, 
                        null as PathValue<TData, Path<TData>>, 
                        {shouldValidate: true, shouldDirty: true, shouldTouch: true}
                      )
                    }
                  >
                    <X size={15} className=' transition-all'/>
                  </Button>
                )}
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={name}
          render={({ field: {value, onChange, ...other} }) => (
            <FormItem className={cn("max-w-28", className)}>
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
