import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import FieldSelect from '~/components/forms/inputs/field-select'
import InputField from '~/components/forms/inputs/simple/input-field'
import TextareaField from '~/components/forms/inputs/simple/textarea-field'
import { Button } from '~/components/ui/button'
import { Form } from '~/components/ui/form'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { updateLicensedAreaSchema, type UpdateLicensedAreaSchema } from '~/lib/validations/forms'
import { updateLicensedArea } from '~/server/actions/licensed-areas'
import { type LicensedAreaExtend } from '~/server/db/schema'

interface UpdateLicensedAreaSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
    licensedArea: LicensedAreaExtend | null
}

export default function UpdateLicensedAreaSheet({
  licensedArea,
  ...props
}: UpdateLicensedAreaSheetProps) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<UpdateLicensedAreaSchema>({
    resolver: zodResolver(updateLicensedAreaSchema),
    defaultValues: {
      id: licensedArea?.id ?? "",
      name: licensedArea?.name ?? "",
      description: licensedArea?.description ?? "",
      fieldId: licensedArea?.fieldId ?? ""
    }
  })


  React.useEffect(() => {
    form.reset({
      id: licensedArea?.id ?? "",
      name: licensedArea?.name ?? "",
      description: licensedArea?.description ?? "",
      fieldId: licensedArea?.fieldId ?? ""
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licensedArea])



  function onSubmit(input: UpdateLicensedAreaSchema) {
    startTransition(async () => {
      if (!licensedArea) return

      const { data, error } = await updateLicensedArea(input)

      if (error) {
        toast.error(error)
        return
      }

      if (data) form.reset(data)
      else form.reset()

      form.reset()
      props.onOpenChange?.(false)
      toast.success("Лицензионный участок изменен!")
    })
  }

  const saveDisabled = isPending || !form.formState.isValid


  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Изменить Лицензионный участок</SheetTitle>
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
              placeholder="Лицензионный участок..."
            />
            <TextareaField 
              form={form}
              name="description"
              label="Описание"
              placeholder="Краткое описание..."
            />
            <FieldSelect
              form={form}
              name="fieldId"
              label="Месторождение"
              handleClear={() => {
                form.setValue(
                  'fieldId', 
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
