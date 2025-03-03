import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import CompanySelect from '~/components/forms/inputs/company-select'
import InputField from '~/components/forms/inputs/simple/input-field'
import TextareaField from '~/components/forms/inputs/simple/textarea-field'
import { Button } from '~/components/ui/button'
import { Form } from '~/components/ui/form'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { updateFieldSchema, type UpdateFieldSchema } from '~/lib/validations/forms'
import { updateField } from '~/server/actions/fields'
import { type FieldExtend } from '~/server/db/schema'

interface UpdateFieldSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  field: FieldExtend | null
}

export default function UpdateFieldSheet({
    field,
    ...props
}: UpdateFieldSheetProps) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<UpdateFieldSchema>({
    resolver: zodResolver(updateFieldSchema),
    defaultValues: {
      id: field?.id ?? "",
      name: field?.name ?? "",
      description: field?.description ?? "",
      companyId: field?.companyId ?? ""
    }
  })

  React.useEffect(() => {
    form.reset({
      id: field?.id ?? "",
      name: field?.name ?? "",
      description: field?.description ?? "",
      companyId: field?.companyId ?? ""
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field])

  function onSubmit(input: UpdateFieldSchema) {
    startTransition(async () => {
      if (!field) return

      const { data, error } = await updateField(input)

      if (error) {
        toast.error(error)
        return
      }

      if (data) form.reset(data)
      else form.reset()

      form.reset()
      props.onOpenChange?.(false)
      toast.success("Месторождение изменено!")
    })
  }

  const saveDisabled = isPending || !form.formState.isValid

  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Изменить Месторождение</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <InputField 
              form={form}
              name="name"
              label="Название"
              placeholder="Месторождение..."
            />
            <TextareaField 
              form={form}
              name="description"
              label="Описание"
              placeholder="Краткое описание..."
            />
            <CompanySelect
              form={form}
              name="companyId"
              label="Компания"
              handleClear={() => {
                form.setValue(
                  'companyId', 
                  '', 
                  {shouldDirty: true, shouldTouch: true, shouldValidate: true}
                )
              }}
            />
            <SheetFooter className="gap-2 pt-2 sm:space-x-0">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Отмена
                </Button>
              </SheetClose>
              <Button disabled={saveDisabled}>
                {isPending && <Loader className="mr-2 size-4 animate-spin" />}
                Сохранить
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
