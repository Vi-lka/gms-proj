import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet'
import { type CreateProfitabilitySchema, createProfitabilitySchema } from '~/lib/validations/forms'
import defaultValues, { defaultValuesElements } from '../areas-data/default-values'
import { createProfitability } from '~/server/actions/profitability'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Loader, Plus } from 'lucide-react'
import { Form } from '~/components/ui/form'
import { ScrollArea } from '~/components/ui/scroll-area'
import NumberField from '~/components/forms/inputs/simple/number-field'
import { idToSentenceCase } from '~/lib/utils'
import { errorToast } from '~/components/ui/special/error-toast'

type CreateProfitabilitySheetProps = React.ComponentPropsWithRef<typeof Sheet>

export default function CreateProfitabilitySheet({
  ...props
}: CreateProfitabilitySheetProps) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<CreateProfitabilitySchema>({
    resolver: zodResolver(createProfitabilitySchema),
    defaultValues,
    mode: "onChange"
  })

  function onSubmit(input: CreateProfitabilitySchema) {
    startTransition(async () => {
      const { error } = await createProfitability(input)

      if (error) {
        errorToast(error, {id: "data-error"})
        return
      }

      form.reset()
      props.onOpenChange?.(false)
      toast.success("Рентабельная добыча создана!")
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
      <SheetContent side="bottom" className="flex flex-col gap-6">
        <SheetHeader className="text-left">
          <SheetTitle>Создать Рентабельную добычу</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <ScrollArea type="always" classNameViewport='p-3 xl:max-h-[70vh] lg:max-h-[65vh] max-h-[60vh]'>
              <div className='flex flex-wrap items-center md:gap-x-3 md:gap-y-6 gap-x-2 gap-y-4 lg:px-3'>
                {defaultValuesElements.map((item, indx) => {
                  const keys = Object.keys(item)
                  return (
                    <NumberField
                      key={"element-"+indx.toString()}
                      form={form}
                      name={keys[0] as keyof CreateProfitabilitySchema}
                      label={idToSentenceCase(keys[0]!)}
                    />
                  )
                })}
              </div>
            </ScrollArea>
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
