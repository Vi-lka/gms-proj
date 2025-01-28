import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Plus } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import InputField from '~/components/forms/inputs/simple/input-field'
import TextareaField from '~/components/forms/inputs/simple/textarea-field'
import { Button } from '~/components/ui/button'
import { Form } from '~/components/ui/form'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet'
import { createCompanySchema, type CreateCompanySchema } from '~/lib/validations/forms'
import { createCompany } from '~/server/actions/companies'

type CreateCompanySheetProps = React.ComponentPropsWithRef<typeof Sheet>

export default function CreateCompanySheet({
  ...props
}: CreateCompanySheetProps) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<CreateCompanySchema>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange"
  })

  function onSubmit(input: CreateCompanySchema) {
    startTransition(async () => {
      const { error } = await createCompany(input)

      if (error) {
        toast.error(error)
        return
      }

      form.reset()
      props.onOpenChange?.(false)
      toast.success("Компания создана!")
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
          <SheetTitle>Создать Компанию</SheetTitle>
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
