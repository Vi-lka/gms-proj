"use client"

import { Loader } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { Skeleton } from '~/components/ui/skeleton'
import { Combobox, ComboboxContent, ComboboxGroup, ComboboxItem, ComboboxTrigger } from '~/components/ui/special/combobox'
import { getApiRoute, type LicensedAreasSearchParamsT } from '~/lib/validations/api-routes'
import { type LicensedArea } from '~/server/db/schema'

interface UpdatePolygonSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
    saveToBackEnd: boolean
    searchParams?: LicensedAreasSearchParamsT,
    onSubmit?:() => void
}

export default function UpdatePolygonSheet({ saveToBackEnd, searchParams, onSubmit, ...props }: UpdatePolygonSheetProps) {
  
  const [open, setOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<{
    value: string;
    label: string;
  }>()

  const [isPending, startTransition] = React.useTransition()

  const polygons = usePolyStore((state) => state.polygons)
  const editPolygonIndex = usePolyStore((state) => state.editPolygonIndex)
  const editPolygonAction = usePolyStore((state) => state.editPolygonAction)
  const setGlobalState = usePolyStore((state) => state.setGlobalState)

  const { pause, resume } = useTemporalStore((state) => state)

  React.useEffect(() => {
    if (editPolygonIndex === null) return;

    const licensedArea = polygons[editPolygonIndex]?.licensedArea

    if (licensedArea) {
      const defaultItem = {value: licensedArea.id, label: licensedArea.name}
      setSelectedItem(defaultItem)
    }
  }, [editPolygonIndex, editPolygonAction, polygons])

  const { data, error, isLoading } = useSWR<LicensedArea[], Error>(
    getApiRoute({
      route: "licensed-areas", 
      searchParams
    })
  );

  if (isLoading) return <Skeleton className='rounded-xl border-border shadow-sm h-9 w-full'/>
  if (error) {
    toast.error(error.message)
    return null;
  }
  if (!data || editPolygonIndex === null) return null;

  const dataForField = data.map(item => {
    return {value: item.id, label: item.name}
  })

  const onSave = () => {
    const copy = [...polygons];
    let polygon = copy[editPolygonIndex];
    if (!polygon || !selectedItem) return;

    polygon = {
      ...polygon,
      licensedArea: {
        id: selectedItem?.value,
        name: selectedItem?.label
      }
    };

    copy[editPolygonIndex] = polygon;

    pause()
    setGlobalState((prev) => ({
      ...prev,
      polygons: copy,
      editPolygonIndex: null,
      editPolygonAction: null,
    }))
    resume()
    
    if (saveToBackEnd) {
      startTransition(async () => {
        // const { data, error } = await updateMapItemCompany(input, company)
  
        // if (error) {
          // toast.error(error)
          // return
        // }
        
        onSubmit?.()
        toast.success("Полигон изменен!")
      })
    }
  }
  const saveDisabled = isPending || !selectedItem

  return (
    <Sheet {...props}>
      <SheetContent 
        onEscapeKeyDown={(ev) => ev.preventDefault()}
        className="flex flex-col gap-6 sm:max-w-md"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Изменить полигон</SheetTitle>
          <SheetDescription>
            Выберите Лизензионный участок
          </SheetDescription>
        </SheetHeader>
        <ScrollArea classNameViewport='p-3'>
          <Combobox 
            open={open} 
            onOpenChange={(open) => {
              setOpen(open)
            }}
            modal
          >
            <ComboboxTrigger 
              placeholder="Лизензионный участок..."
              selectedValue={selectedItem?.value}
              handleClear={() => setSelectedItem(undefined)}
            >
              {selectedItem?.label}
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxGroup>
                {dataForField.map((item) => (
                  <ComboboxItem
                    key={item.value}
                    value={item.label} // for CommandInput
                    selectedValue={selectedItem?.label}
                    onSelect={() => {
                      setSelectedItem(item)
                      setOpen(false)
                    }}
                  >
                    {item.label}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            </ComboboxContent>
          </Combobox>
        </ScrollArea>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </SheetClose>
          <Button 
            disabled={saveDisabled}
            onClick={onSave}
          >
            {isPending && (
              <Loader
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Сохранить
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
