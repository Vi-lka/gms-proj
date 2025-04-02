import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import InputField from '~/components/forms/inputs/simple/input-field'
import TextareaField from '~/components/forms/inputs/simple/textarea-field'
import { Button } from '~/components/ui/button'
import { Form } from '~/components/ui/form'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { errorToast } from '~/components/ui/special/error-toast'
import { updateCompanySchema, type UpdateCompanySchema } from '~/lib/validations/forms'
import { updateCompany } from '~/server/actions/companies'
import { type Company } from '~/server/db/schema'

interface UpdateCompanySheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
  company: Company | null
}

export default function UpdateCompanySheet({
  company,
  ...props
}: UpdateCompanySheetProps) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<UpdateCompanySchema>({
    resolver: zodResolver(updateCompanySchema),
    defaultValues: {
      id: company?.id ?? "",
      name: company?.name ?? "",
      description: company?.description ?? "",
    }
  })

  React.useEffect(() => {
    form.reset({
      id: company?.id ?? "",
      name: company?.name ?? "",
      description: company?.description ?? "",
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company])

  function onSubmit(input: UpdateCompanySchema) {
    startTransition(async () => {
      if (!company) return

      const { data, error } = await updateCompany(input)

      if (error) {
        errorToast(error, {id: "data-error"})
        return
      }

      if (data) form.reset(data)
      else form.reset()

      form.reset()
      props.onOpenChange?.(false)
      toast.success("Компания изменена!")
    })
  }

  const saveDisabled = isPending || !form.formState.isValid

  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Изменить Компанию</SheetTitle>
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
