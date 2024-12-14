"use client"
/* eslint-disable @typescript-eslint/unbound-method */

import React from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { type CreateMapItemSchema } from '~/lib/validations/forms'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { ScrollArea } from '~/components/ui/scroll-area'
import CreateCompanyForm from '~/components/forms/create/create-company-form'
import CreateClusterForm from '~/components/forms/create/create-cluster-form'


interface AddEllementSheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
  mapItem: CreateMapItemSchema | null
}

export default function AddEllementSheet({ mapItem, ...props }: AddEllementSheetProps) {
  if (!mapItem) return null
  return (
    <Sheet {...props}>
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Добавить метку</SheetTitle>
          <SheetDescription>
            Компанию или Кластер
          </SheetDescription>
        </SheetHeader>
        <ScrollArea classNameViewport='p-3'>
          <Tabs defaultValue="company" className="w-full">
            <TabsList className='flex justify-center'>
              <TabsTrigger value="company">Компания</TabsTrigger>
              <TabsTrigger value="cluster">Кластер</TabsTrigger>
            </TabsList>
            <TabsContent value="company">
              <CreateCompanyForm mapItem={mapItem} onOpenChange={props.onOpenChange} />
            </TabsContent>
            <TabsContent value="cluster">
              <CreateClusterForm mapItem={mapItem} onOpenChange={props.onOpenChange} />
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
