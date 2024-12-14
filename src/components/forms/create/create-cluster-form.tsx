"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import CompaniesInput from '~/components/forms/inputs/companies-input'
import InputField from '~/components/forms/inputs/simple/input-field'
import TextareaField from '~/components/forms/inputs/simple/textarea-field'
import { Button } from '~/components/ui/button'
import { Form } from '~/components/ui/form'
import { SheetClose, SheetFooter } from '~/components/ui/sheet'
import { useRevertStageEllementPos } from '~/hooks/use-stage-ellement-pos'
import { createClusterSchema, type CreateMapItemSchema, type CreateClusterSchema } from '~/lib/validations/forms'
import { createCluster } from '~/server/actions/clusters'

export default function CreateClusterForm({
  mapItem,
  onOpenChange,
}: {
  mapItem: CreateMapItemSchema,
  onOpenChange:((open: boolean) => void) | undefined
}) {
  const revertMapItem = useRevertStageEllementPos(
    { x: mapItem.xPos, y: mapItem.yPos }
  )

  const [isPending, startTransition] = React.useTransition()

  const form = useForm<CreateClusterSchema>({
    resolver: zodResolver(createClusterSchema),
    defaultValues: {
      name: "",
      description: "",
      companies: []
    },
    mode: "onChange"
  })

  function onSubmit(input: CreateClusterSchema) {
    startTransition(async () => {
      const { error } = await createCluster({
        input,
        mapItem: {xPos: revertMapItem.pos.x, yPos: revertMapItem.pos.y, description: mapItem.description}
      })

      if (error) {
        toast.error(error)
        return
      }

      form.reset()
      onOpenChange?.(false)
      toast.success("Кластер добавлен!")
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
          name="companies"
          label="Компании"
          isPending={isPending}
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
