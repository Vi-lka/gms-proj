import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Plus } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import FieldSelect from '~/components/forms/inputs/field-select'
import InputField from '~/components/forms/inputs/simple/input-field'
import TextareaField from '~/components/forms/inputs/simple/textarea-field'
import { Button } from '~/components/ui/button'
import { Form } from '~/components/ui/form'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet'
import { errorToast } from '~/components/ui/special/error-toast'
import { createLicensedAreaSchema, type CreateLicensedAreaSchema } from '~/lib/validations/forms'
import { createLicensedArea } from '~/server/actions/licensed-areas'

type CreateLicensedAreaSheetProps = React.ComponentPropsWithRef<typeof Sheet>

export default function CreateLicensedAreaSheet({
  ...props
}: CreateLicensedAreaSheetProps) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<CreateLicensedAreaSchema>({
    resolver: zodResolver(createLicensedAreaSchema),
    defaultValues: {
      name: "",
      description: "",
      fieldId: ""
    },
    mode: "onChange"
  })

  function onSubmit(input: CreateLicensedAreaSchema) {
    startTransition(async () => {
      const { error } = await createLicensedArea(input)

      if (error) {
        errorToast(error, {id: "data-error"})
        return
      }

      form.reset()
      props.onOpenChange?.(false)
      toast.success("Лицензионный участок создан!")
    })
  }

  const saveDisabled = isPending || !form.formState.isValid

  return (
    <Sheet {...props}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          className="gap-2 h-7"
        >
          Создать <Plus size={16} className='flex-none' />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Создать Лицензионный участок</SheetTitle>
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
                Создать
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
