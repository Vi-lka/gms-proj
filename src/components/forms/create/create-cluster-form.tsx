"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, X } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import CompaniesInput from '~/components/forms/inputs/companies-input'
import InputField from '~/components/forms/inputs/simple/input-field'
import TextareaField from '~/components/forms/inputs/simple/textarea-field'
import { Button } from '~/components/ui/button'
import { Form } from '~/components/ui/form'
import { Separator } from '~/components/ui/separator'
import { SheetClose, SheetFooter } from '~/components/ui/sheet'
import { useRevertStageEllementPos } from '~/hooks/use-stage-ellement-pos'
import { createMapItemClusterSchema, type MapItemSchema, type CreateMapItemClusterSchema } from '~/lib/validations/forms'
import { createMapItemCluster } from '~/server/actions/mapItems'
import ClusterSelect from '../inputs/cluster-select'

export default function CreateClusterForm({
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

  const form = useForm<CreateMapItemClusterSchema>({
    resolver: zodResolver(createMapItemClusterSchema),
    defaultValues: {
      name: "",
      description: "",
      clusterId: null,
      companiesInput: []
    },
    mode: "onChange"
  })

  function onSubmit(input: CreateMapItemClusterSchema) {
    startTransition(async () => {
      const { error } = await createMapItemCluster({
        ...input,
        xPos: revertMapItem.pos.x,
        yPos: revertMapItem.pos.y
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

  const hasCluster = !!form.getValues("clusterId")

  const saveDisabled = isPending || !form.formState.isValid

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className='flex items-end gap-1 mt-2'>
          <ClusterSelect
            form={form}
            name="clusterId"
            label="Выберите Кластер"
            onOpenChange={() => form.clearErrors()}
            hasMapItem={false}
            className='flex-1'
          />
          {hasCluster && (
            <Button
              variant="outline"
              onClick={() => form.setValue(
                "clusterId",
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
          name="companiesInput"
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
