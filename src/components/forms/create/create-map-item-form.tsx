"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Form } from '~/components/ui/form'
import { useRevertStageEllementPos } from '~/hooks/use-stage-ellement-pos'
import { createMapItemSchema, type CreateMapItemSchema, type MapItemSchema } from '~/lib/validations/forms'
import InputField from '../inputs/simple/input-field'
import TextareaField from '../inputs/simple/textarea-field'
import { SheetClose, SheetFooter } from '~/components/ui/sheet'
import { Button } from '~/components/ui/button'
import { Loader, X } from 'lucide-react'
import { Separator } from '~/components/ui/separator'
import CompanySelect from '../inputs/company-select'
import { createMapItem } from '~/server/actions/mapItems'

export default function CreateMapItemForm({
  mapItem,
  onOpenChange,
}: {
  mapItem: MapItemSchema,
  onOpenChange:((open: boolean) => void) | undefined
}) {
  const revertMapItem = useRevertStageEllementPos(
    { x: mapItem.xPos, y: mapItem.yPos }
  )

  const [isPending, startTransition] = React.useTransition()

  const form = useForm<CreateMapItemSchema>({
    resolver: zodResolver(createMapItemSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onChange"
  })

  function onSubmit(input: CreateMapItemSchema) {
    startTransition(async () => {
      const { error } = await createMapItem({
        ...input,
        xPos: revertMapItem.pos.x, 
        yPos: revertMapItem.pos.y
      })

      if (error) {
        console.error(error)
        toast.error(error)
        return
      }

      form.reset()
      onOpenChange?.(false)
      toast.success("Точка добавлена!")
    })
  }

  const hasCompany = !!form.getValues("id")

  const saveDisabled = isPending || !form.formState.isValid

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className='flex items-end gap-1 mt-2'>
          <CompanySelect
            form={form}
            name="id"
            label="Выберите Компанию"
            onOpenChange={() => form.clearErrors()}
            className='flex-1'
          />
          {hasCompany && (
            <Button
              variant="outline"
              onClick={() => form.setValue(
                "id", 
                null, 
                {shouldDirty: true, shouldTouch: true, shouldValidate: true}
              )}
              className='px-1'
            >
              <X/>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-muted-foreground">Или</span>
          <Separator className="flex-1" />
        </div>
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
            Сохранить
          </Button>
        </SheetFooter>
      </form>
    </Form>
  )
}
