"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createClusterSchema, type CreateMapItemSchema, type CreateClusterSchema } from '~/lib/validations/forms'
import { createCluster } from '~/server/actions/companies'

export default function CreateClusterForm({
  mapItem,
  onOpenChange,
}: {
  mapItem: CreateMapItemSchema,
  onOpenChange:((open: boolean) => void) | undefined
}) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<CreateClusterSchema>({
    resolver: zodResolver(createClusterSchema),
    defaultValues: {
      name: "",
      image: null,
      description: null,
      companies: []
    },
  })

  function onSubmit(input: CreateClusterSchema) {
    startTransition(async () => {
      const { error } = await createCluster({
        input,
        mapItem
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

  return (
    <div>create-cluster-form</div>
  )
}
