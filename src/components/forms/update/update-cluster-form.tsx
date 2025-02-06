import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Form } from '~/components/ui/form'
import { updateMapItemClusterSchema, type UpdateMapItemClusterSchema } from '~/lib/validations/forms'
import InputField from '../inputs/simple/input-field'
import TextareaField from '../inputs/simple/textarea-field'
import CompaniesInput from '../inputs/companies-input'
import { SheetClose, SheetFooter } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { Loader } from 'lucide-react'
import { updateMapItemCluster } from '~/server/actions/mapItems'

export default function UpdateClusterForm({
  cluster,
  onFormSubmit
}: {
  cluster: UpdateMapItemClusterSchema,
  onFormSubmit:(() => void) | undefined
}) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<UpdateMapItemClusterSchema>({
    resolver: zodResolver(updateMapItemClusterSchema),
    defaultValues: cluster,
    mode: "onChange"
  })

  function onSubmit(input: UpdateMapItemClusterSchema) {
    startTransition(async () => {
      const { data, error } = await updateMapItemCluster(input, cluster.companiesInput)

      if (error) {
        toast.error(error)
        return
      }

      if (data) form.reset(data)
      else form.reset()

      onFormSubmit?.()
      toast.success("Кластер изменен!")
    })
  }

  const saveDisabled = isPending || !form.formState.isValid || !form.formState.isDirty


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
          name="companiesInput"
          label="Компании"
          isPending={isPending}
          defaultCompanies={cluster.companiesInput}
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
