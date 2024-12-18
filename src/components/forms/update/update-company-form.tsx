import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Form } from '~/components/ui/form'
import { updateCompanySchema, type UpdateCompanySchema } from '~/lib/validations/forms'
import InputField from '../inputs/simple/input-field'
import TextareaField from '../inputs/simple/textarea-field'
import { SheetClose, SheetFooter } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { Loader } from 'lucide-react'
import { updateCompany } from '~/server/actions/companies'

export default function UpdateCompanyForm({
  company,
  onFormSubmit
}: {
  company: UpdateCompanySchema
  onFormSubmit:(() => void) | undefined
}) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<UpdateCompanySchema>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: company,
    mode: "onChange"
  })

  function onSubmit(input: UpdateCompanySchema) {
    startTransition(async () => {
      const { data, error } = await updateCompany(input)

      if (error) {
        toast.error(error)
        return
      }

      if (data) form.reset(data)
      else form.reset()
      
      onFormSubmit?.()
      toast.success("Компания изменена!")
    })
  }

  const saveDisabled = isPending || !form.formState.isValid

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <InputField 
          form={form}
          name="name"
          label="Название"
          placeholder="Компания..."
        />
        <TextareaField 
          form={form}
          name="description"
          label="Описание"
          placeholder="Краткое описание..."
        />
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
