import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Plus } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import CompanySelect from '~/components/forms/inputs/company-select'
import InputField from '~/components/forms/inputs/simple/input-field'
import TextareaField from '~/components/forms/inputs/simple/textarea-field'
import { Button } from '~/components/ui/button'
import { Form } from '~/components/ui/form'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet'
import { createFieldSchema, type CreateFieldSchema } from '~/lib/validations/forms'
import { createField } from '~/server/actions/fields'

type CreateFieldSheetProps = React.ComponentPropsWithRef<typeof Sheet>

export default function CreateFieldSheet({
  ...props
}: CreateFieldSheetProps) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<CreateFieldSchema>({
    resolver: zodResolver(createFieldSchema),
    defaultValues: {
      name: "",
      description: "",
      companyId: ""
    },
    mode: "onChange"
  })

  function onSubmit(input: CreateFieldSchema) {
    startTransition(async () => {
      const { error } = await createField(input)

      if (error) {
        toast.error(error)
        return
      }

      form.reset()
      props.onOpenChange?.(false)
      toast.success("Месторождение создано!")
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
          <SheetTitle>Создать Месторождение</SheetTitle>
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
                Создать
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
