import React, { useEffect, useState } from 'react'
import { type Path, type UseFormReturn, type FieldValues, type PathValue } from 'react-hook-form'
import { type CreateMapItemSchema } from '~/lib/validations/forms'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion'
import { Button } from '../../ui/button'
import { Delete, Plus } from 'lucide-react'
import { cn } from '~/lib/utils'
import CompanySelect from './company-select'
import FieldsSelect from './fields-select'
import useSWR from 'swr'
import { type Company } from '~/server/db/schema'
import { getApiRoute } from '~/lib/validations/api-routes'

export default function CompaniesInput<TData extends FieldValues>({
  form,
  name,
  label,
  defaultCompanies,
  className,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<TData, any, undefined>,
  name: Path<TData>,
  isPending: boolean,
  label?: React.ReactNode,
  defaultCompanies?: CreateMapItemSchema[],
  className?: string,
}) {
  const [accordionValue, setAccordionValue] = useState<string | undefined>()
  const [companies, setCompanies] = useState<CreateMapItemSchema[]>([])

  const { data: allCompanies, error, isLoading } = useSWR<Company[], Error>(
    getApiRoute({ route: "companies" })
  );

  const data = form.getValues(name) as CreateMapItemSchema[] | null | undefined

  useEffect(() => {
    if (data) setCompanies(data)
  }, [data])

  return (
    <div className={cn('space-y-2 !mb-3 w-full', className)}>
      <p className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 my-2'>{label}:</p>
      {companies.length > 0
        ? (
          <Accordion 
            type='single'
            collapsible
            value={accordionValue}
            onValueChange={(value) => setAccordionValue(value)}
            className='mb-2'
          >
            {companies.map((company, indx) => {
              const hasCompany = !!(form.getValues(`${name}[${indx}].id` as Path<TData>))
              const selectedCompany = allCompanies?.find(comp => comp.id === form.getValues(`${name}[${indx}].id` as Path<TData>))?.name
              const title = (hasCompany && !error && !isLoading && selectedCompany) 
                ? selectedCompany
                : company.id

              const thisCompanyFormDefaultValues = defaultCompanies?.find(defComp => defComp.id === company.id)

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
                        setAccordionValue('')
                        const newCompanies = companies.filter((_, i) => indx !== i)
                        setCompanies(newCompanies)
                        form.setValue(
                          name,
                          newCompanies as PathValue<TData, Path<TData>>, 
                          {shouldDirty: true, shouldTouch: true, shouldValidate: true}
                        )
                      }}
                    >
                      <Delete size={16}/>
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='flex flex-col gap-4 border-2 border-b-0 border-boder rounded-t-xl p-3'>
                  <div className='flex items-end gap-1 mt-2'>
                    <CompanySelect
                      form={form}
                      name={`${name}[${indx}].id` as Path<TData>}
                      label="Выберите Компанию"
                      handleClear={() => {
                        form.setValue(
                          `${name}[${indx}].id` as Path<TData>, 
                          null as PathValue<TData, Path<TData>>,
                          {shouldDirty: true, shouldTouch: true, shouldValidate: true}
                        )
                        form.setValue(
                          `${name}[${indx}].fields` as Path<TData>, 
                          [] as PathValue<TData, Path<TData>>,
                          {shouldDirty: true, shouldTouch: true, shouldValidate: true}
                        )
                      }}
                      onOpenChange={() => form.clearErrors()}
                      onSelect={() => {
                        form.setValue(
                          `${name}[${indx}].fields` as Path<TData>,
                          [] as PathValue<TData, Path<TData>>,
                          {shouldDirty: true, shouldTouch: true, shouldValidate: true}
                        )
                      }}
                      className='flex-1'
                    />
                  </div>
                  {hasCompany && (
                    <FieldsSelect
                      form={form}
                      name={`${name}[${indx}].fields` as Path<TData>}
                      label="Выберите Месторождения"
                      onOpenChange={() => form.clearErrors()}
                      searchParams={{
                        hasMapItem: false,
                        companyId: form.getValues(`${name}[${indx}].id` as Path<TData>),
                        fieldsIds: form.getValues(`${name}[${indx}].id` as Path<TData>) === thisCompanyFormDefaultValues?.id 
                          ? thisCompanyFormDefaultValues.fields 
                          : undefined
                      }}
                    />
                  )}
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
          setCompanies([
            ...companies,
            {id: '', fields: []}
          ])
            form.setValue(
              name, 
              [
                ...companies,
                {id: '', fields: []}
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
