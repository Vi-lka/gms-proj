import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type CreateProfitabilitySchema, updateProfitabilitySchema, type UpdateProfitabilitySchema } from '~/lib/validations/forms'
import { type Profitability } from '~/server/db/schema'
import defaultValues, { defaultValuesElements } from '../areas-data/default-values'
import { updateProfitability } from '~/server/actions/profitability'
import { toast } from 'sonner'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { Form } from '~/components/ui/form'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Button } from '~/components/ui/button'
import { Loader } from 'lucide-react'
import NumberField from '~/components/forms/inputs/simple/number-field'
import { idToSentenceCase } from '~/lib/utils'

interface UpdateProfitabilitySheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
    profitability: Profitability | null
}

export default function UpdateProfitabilitySheet({
  profitability,
  ...props
}: UpdateProfitabilitySheetProps) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<UpdateProfitabilitySchema>({
    resolver: zodResolver(updateProfitabilitySchema),
    defaultValues: profitability ?? defaultValues,
  })

  React.useEffect(() => {
    form.reset(profitability ?? defaultValues)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profitability])

  function onSubmit(input: UpdateProfitabilitySchema) {
    startTransition(async () => {
      if (!profitability) return;

      const { data, error } = await updateProfitability(input)

      if (error) {
        toast.error(error)
        return
      }

      if (data) form.reset(data)
      else form.reset()

      form.reset()
      props.onOpenChange?.(false)
      toast.success("Данные ЛУ изменены!")
    })
  }

  const saveDisabled = isPending || !form.formState.isValid


  return (
    <Sheet {...props}>
      <SheetContent side="bottom" className="flex flex-col gap-6">
        <SheetHeader className="text-left">
          <SheetTitle>Изменить Данные ЛУ</SheetTitle>
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
                  Сохранить
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
