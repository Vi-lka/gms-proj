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
import { type LicensedAreaExtend } from '~/server/db/schema'

interface AddPolygonSheetProps
  extends React.ComponentPropsWithRef<typeof Sheet> {
    searchParams?: LicensedAreasSearchParamsT,
}

export default function AddPolygonSheet({ searchParams, ...props }: AddPolygonSheetProps) {
  const [open, setOpen] = React.useState(false)

  const polygons = usePolyStore((state) => state.polygons)
  const activePolygonIndex = usePolyStore((state) => state.activePolygonIndex)
  const setPolygons = usePolyStore((state) => state.setPolygons)
  const setGlobalState = usePolyStore((state) => state.setGlobalState)

  const { clear } = useTemporalStore((state) => state)

  const { data, error, isLoading } = useSWR<LicensedAreaExtend[], Error>(
    getApiRoute({
      route: "licensed-areas", 
      searchParams
    })
  );

  if (error) {
    toast.error(error.message)
    return null;
  }
  if (!data || !polygons[activePolygonIndex]) return null

  const dataForField = data.map(item => {
    return {value: item.id, label: item.name, description: `(${item.fieldName} - ${item.companyName})`}
  }).filter(item => 
    !polygons.some(polygon => polygon.licensedArea?.id === item.value)
    ||
    polygons[activePolygonIndex]?.licensedArea?.id === item.value
  )

  const onSelect = (id: string, name: string) => {
    const copy = [...polygons];
    let polygon = copy[activePolygonIndex];
    if (!polygon) return;

    const flattenedPoints = polygon.flattenedPoints
    const needFixFlattenedPoints = flattenedPoints.length > polygon.points.length * 2

    polygon = {
      ...polygon,
      flattenedPoints: needFixFlattenedPoints ? flattenedPoints.slice(0, -2) : flattenedPoints, // Fix flattenedPoints length
      licensedArea: {
        id,
        name
      }
    };

    copy[activePolygonIndex] = polygon;
    setPolygons(copy);
  }

  const handleClear = () => {
    const copy = [...polygons];
    let polygon = copy[activePolygonIndex];
    if (!polygon) return;

    polygon = {
      ...polygon,
      licensedArea: null
    };

    copy[activePolygonIndex] = polygon;
    setPolygons(copy);
  }

  const licensedArea = polygons[activePolygonIndex]?.licensedArea

  const selectedValue= dataForField.find(item => item.value === licensedArea?.id)

  return (
    <Sheet {...props}>
      <SheetContent 
        onEscapeKeyDown={(ev) => ev.preventDefault()}
        className="flex flex-col gap-6 sm:max-w-md"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Добавить полигон</SheetTitle>
          <SheetDescription>
            Выберите Лизензионный участок
          </SheetDescription>
        </SheetHeader>
        <ScrollArea classNameViewport='p-3'>
          {isLoading ? (
            <Skeleton className='rounded-xl border-border shadow-sm h-9 w-full'/>
          ) : (
            <Combobox 
              open={open} 
              onOpenChange={(open) => {
                setOpen(open)
              }}
              modal
            >
              <ComboboxTrigger 
                placeholder="Лизензионный участок..."
                selectedValue={selectedValue?.value}
                handleClear={handleClear}
              >
                {selectedValue?.label}
              </ComboboxTrigger>
              <ComboboxContent>
                <ComboboxGroup>
                  {dataForField.map((item) => (
                    <ComboboxItem
                      key={item.value}
                      value={item.label} // for CommandInput
                      selectedValue={selectedValue?.label}
                      onSelect={() => {
                        onSelect(item.value, item.label)
                        setOpen(false)
                      }}
                    >
                      <div className='flex flex-col'>
                        {item.label}
                        <span className='line-clamp-2 text-[9px] leading-3 text-muted-foreground'>{item.description}</span>
                      </div>
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </ComboboxContent>
            </Combobox>
          )}
        </ScrollArea>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Отмена
            </Button>
          </SheetClose>
          <Button 
            disabled={!selectedValue}
            onClick={() => {
              setGlobalState((prev) => ({
                ...prev,
                isAddible: false,
                askAcceptPos: false,
                openSheet: false,
                activePolygonIndex: -1
              }))
              clear()
            }}
          >
            Сохранить
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
