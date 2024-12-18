import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Form } from '~/components/ui/form'
import { companyToClusterSchema, type CompanyToClusterSchema, type UpdateCompanySchema } from '~/lib/validations/forms'
import { companyToCluster } from '~/server/actions/companies'
import InputField from '../inputs/simple/input-field'
import TextareaField from '../inputs/simple/textarea-field'
import CompaniesInput from '../inputs/companies-input'
import { SheetClose, SheetFooter } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { Loader } from 'lucide-react'

export default function CompanyToClusterForm({
  company,
  onFormSubmit
}: {
  company: UpdateCompanySchema
  onFormSubmit:(() => void) | undefined
})  {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<CompanyToClusterSchema>({
    resolver: zodResolver(companyToClusterSchema),
    defaultValues: {
      name: "",
      description: "",
      companies: [company]
    },
    mode: "onChange"
  })

  function onSubmit(input: CompanyToClusterSchema) {
    startTransition(async () => {
      const { error } = await companyToCluster(input, company)

      if (error) {
        toast.error(error)
        return
      }

      form.reset()
      onFormSubmit?.()
      toast.success("Кластер добавлен!")
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
          placeholder="Кластер..."
        />
        <TextareaField 
          form={form}
          name="description"
          label="Описание"
          placeholder="Краткое описание..."
        />
        <CompaniesInput 
          form={form}
          name="companies"
          label="Компании"
          isPending={isPending}
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
