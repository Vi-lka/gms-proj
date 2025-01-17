import React, { useState } from 'react'
import { type Path, type UseFormReturn, type FieldValues, type PathValue } from 'react-hook-form'
import { type CompanySchema } from '~/lib/validations/forms'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion'
import { Button } from '../../ui/button'
import { Delete, Plus, X } from 'lucide-react'
import { FormLabel } from '../../ui/form'
import { cn } from '~/lib/utils'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import CompanySelect from './company-select'
import { Separator } from '~/components/ui/separator'

export default function CompaniesInput<TData extends FieldValues>({
  form,
  name,
  isPending,
  label,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TData, any, undefined>,
  name: Path<TData>,
  isPending: boolean,
  label?: React.ReactNode,
  className?: string,
}) {
  const [accordionValue, setAccordionValue] = useState<string | undefined>()

  const data = form.getValues(name) as CompanySchema[] | null | undefined

  const companies = data ? data : []

  return (
    <div className={cn('space-y-2 !mb-3 w-full', className)}>
      <p className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 my-2'>{label}:</p>
      {companies.length > 0
        ? (
          <Accordion 
            type="single"
            collapsible
            value={accordionValue}
            onValueChange={(value) => setAccordionValue(value)}
            className='mb-2'
          >
            {companies.map((company, indx) => {
              const hasCompany = !!(form.getValues(`${name}[${indx}].companyId` as Path<TData>))
              const title = hasCompany ? form.getValues(`${name}[${indx}].companyId` as Path<TData>) : company.name

              return (
              <AccordionItem key={indx} value={`${indx}`} className='border-b-2'>
                <AccordionTrigger className='py-2 justify-end'>
                  <div className='flex w-full flex-1 items-center justify-between gap-3'>
                    <p className='flex-1 text-left text-base truncate min-w-0 w-0'>{title}</p>
                    <Button
                      type='button'
                      asChild
                      className='w-fit h-fit p-1 mr-1 z-50'
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.setValue(
                          name,
                          companies.filter((_, i) => indx !== i) as PathValue<TData, Path<TData>>, 
                          {shouldDirty: true, shouldTouch: true, shouldValidate: true}
                        )
                      }}
                    >
                      <Delete size={16}/>
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='flex flex-col gap-2 border-2 border-b-0 border-boder rounded-t-xl p-3'>
                  <div className='flex items-end gap-1 mt-2'>
                    <CompanySelect
                      form={form}
                      name={`${name}[${indx}].companyId` as Path<TData>}
                      label="Выберите Компанию"
                      onOpenChange={() => form.clearErrors()}
                      className='flex-1'
                    />
                    {hasCompany && (
                      <Button
                        variant="outline"
                        onClick={() => form.setValue(
                          `${name}[${indx}].companyId` as Path<TData>, 
                          null as PathValue<TData, Path<TData>>,
                          {shouldDirty: true, shouldTouch: true, shouldValidate: true}
                        )}
                        className='px-1'
                      >
                        <X/>
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <Separator className="flex-1" />
                    <span className="text-muted-foreground">Или</span>
                    <Separator className="flex-1" />
                  </div>

                  <div className='w-full'>
                    <FormLabel>Название</FormLabel>
                    <Input
                      value={form.getValues(`${name}[${indx}].name` as Path<TData>) as string}
                      placeholder="Компания..."
                      disabled={form.formState.isSubmitting || isPending}
                      onChange={(e) => form.setValue(
                        `${name}[${indx}].name` as Path<TData>, 
                        e.target.value as PathValue<TData, Path<TData>>,
                        {shouldDirty: true, shouldTouch: true, shouldValidate: true}
                      )}
                    />
                  </div>

                  <div className='w-full'>
                    <FormLabel>Описание</FormLabel>
                    <Textarea
                      value={form.getValues(`${name}[${indx}].description` as Path<TData>)}
                      placeholder="Краткое описание..."
                      disabled={form.formState.isSubmitting || isPending}
                      onChange={(e) => form.setValue(
                        `${name}[${indx}].description` as Path<TData>, 
                        e.target.value as PathValue<TData, Path<TData>>,
                        {shouldDirty: true, shouldTouch: true, shouldValidate: true}
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )})}
          </Accordion>
        )
        : null
      }
      <Button 
        className='w-full'
        type="button"
        onClick={() => {
            form.setValue(
              name, 
              [
                ...companies,
                {name: "", description: ""}
              ] as PathValue<TData, Path<TData>>,
              {shouldDirty: true, shouldTouch: true, shouldValidate: true}
            )
            setAccordionValue(companies.length.toString())
          }
        }
      >
        <Plus className='w-5 h-5 mr-1'/>Добавить
      </Button>
    </div>
  )
}
