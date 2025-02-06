import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Form } from '~/components/ui/form'
import { updateMapItemCompanySchema, type UpdateMapItemCompanySchema } from '~/lib/validations/forms'
import { SheetClose, SheetFooter } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { Loader } from 'lucide-react'
import { updateMapItemCompany } from '~/server/actions/mapItems'
import CompanySelect from '../inputs/company-select'
import FieldsSelect from '../inputs/fields-select'

export default function UpdateCompanyMapItemForm({
  company,
  onFormSubmit
}: {
  company: UpdateMapItemCompanySchema
  onFormSubmit:(() => void) | undefined
}) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<UpdateMapItemCompanySchema>({
    resolver: zodResolver(updateMapItemCompanySchema),
    defaultValues: company,
    mode: "onChange"
  })

  function onSubmit(input: UpdateMapItemCompanySchema) {
    startTransition(async () => {
      const { data, error } = await updateMapItemCompany(input, company)

      if (error) {
        toast.error(error)
        return
      }

      if (data) form.reset(data)
      else form.reset()
      
      onFormSubmit?.()
      toast.success("Точка изменена!")
    })
  }

  const hasCompany = !!form.getValues("id")

  const saveDisabled = isPending || !form.formState.isValid || !form.formState.isDirty

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <CompanySelect
          form={form}
          name="id"
          label="Выберите Компанию"
          handleClear={() => {
            form.setValue(
              "id", 
              '', 
              {shouldDirty: true, shouldTouch: true, shouldValidate: true}
            )
            form.setValue(
              "fields", 
              [], 
              {shouldDirty: true, shouldTouch: true, shouldValidate: true}
            )
          }}
          onSelect={() => {
            form.setValue(
              "fields", 
              [], 
              {shouldDirty: true, shouldTouch: true, shouldValidate: true}
            )
          }}
          className='flex-1'
        />
        {hasCompany && (
          <FieldsSelect
            form={form}
            name="fields"
            label="Выберите Месторождения"
            searchParams={{
              hasMapItem: false,
              companyId: form.getValues("id"),
              fieldsIds: form.getValues("id") === company.id ? company.fields : undefined
            }}
          />
        )}
        <SheetFooter className="gap-2 pt-2 sm:space-x-0">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </SheetClose>
          <Button disabled={saveDisabled}>
            {isPending && (
              <Loader
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Сохранить
          </Button>
        </SheetFooter>
      </form>
    </Form>
  )
}
