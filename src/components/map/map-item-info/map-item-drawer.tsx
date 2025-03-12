import { useAtom } from 'jotai'
import React from 'react'
import { selectedItemAtom } from '~/lib/atoms/main'
import { Button } from '../../ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '../../ui/drawer'
import { Separator } from '../../ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { cn, idToSentenceCase } from '~/lib/utils'
import { Database, LandPlot, Loader, Pickaxe } from 'lucide-react'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Badge } from '~/components/ui/badge'
import { TooltipProvider } from '~/components/ui/tooltip'
import { type MaxValue } from '~/lib/types'
import { type Profitability } from '~/server/db/schema'
import Link from 'next/link'
import TooltipClick from '~/components/ui/special/tooltip-click'

export default function MapItemDrawer() {
  const [isPending, startTransition] = React.useTransition()

  const [selectedItem, setSelectedItem] = useAtom(selectedItemAtom)

  if (!selectedItem) return null;

  return (
    <Drawer open={selectedItem !== null} onClose={() => setSelectedItem(null)}>
      <DrawerContent className='z-[150] lg:max-w-[768px] rounded-t-2xl'>
        <DrawerHeader>
          <DrawerTitle className='text-center line-clamp-2'>
            {selectedItem.cluster 
              ? selectedItem.cluster.name
              : selectedItem.companies[0]?.name
            }
          </DrawerTitle>
          {selectedItem.cluster && 
            <div className='flex flex-col items-center w-full text-sm text-muted-foreground'>
              {selectedItem.companies.map((comp, indx) => (
                <div key={indx}>
                  <span className='line-clamp-2 mb-1'>
                    {comp.name}
                  </span>
                  {indx < selectedItem.companies.length - 1 && (
                    <Separator className='bg-foreground mb-1' />
                  )}
                </div>
              ))}
            </div>
          }
        </DrawerHeader>
        <div className="px-4">
          <ScrollArea type='scroll' classNameViewport='md:max-h-[70vh] md:!overflow-hidden max-h-[50vh] pr-2'>
            <div className='flex lg:flex-nowrap md:flex-wrap flex-wrap-reverse gap-6 justify-evenly'>
              <Card className='min-h-52 md:max-h-64 lg:max-w-[33%] sm:w-auto w-full'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    Месторождения
                    <Pickaxe size={18} className='flex-none' />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea type='always' classNameViewport='max-h-full md:max-h-36 pr-2'>
                    {selectedItem.fields.map((field, indx) => (
                      <p key={field.id} className={cn(
                        "text-sm py-2 line-clamp-2",
                        indx < selectedItem.fields.length - 1 && "border-b-2"
                      )}>
                        {field.name} 
                        <span className='ml-1 text-xs font-light'>({selectedItem.companies.find((comp) => comp.id === field.companyId)?.name})</span>
                      </p>
                    ))} 
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className='min-h-52 md:max-h-64 lg:max-w-[33%] sm:w-auto w-full'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    Лицензионные участки
                    <LandPlot size={18} className='flex-none' />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea type='always' classNameViewport='max-h-full md:max-h-36 pr-2'>
                    {selectedItem.fields.map((field, fieldIndx) => 
                      field.licensedAreas.map((area, indx) => (
                        <p key={area.id} className={cn(
                          "text-sm py-2 line-clamp-2",
                          (indx < field.licensedAreas.length - 1 || fieldIndx < selectedItem.fields.length - 1) && "border-b-2"
                        )}>
                          {area.name} 
                          <span className='ml-1 text-xs font-light'>({field.name})</span>
                        </p>
                      ))
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className='min-h-52 max-h-64 lg:max-w-[33%] sm:w-auto w-full'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    Наибольшие значения
                    <Database size={18} className='flex-none' />
                  </CardTitle>
                </CardHeader>
                <CardContent className='flex gap-2 items-end justify-center h-2/3'>
                  <TooltipProvider delayDuration={150}> 
                    {selectedItem.maxElements.original.map((el, index) => (
                      <ElementBadge key={index} element={el} index={index} maxValue={selectedItem.maxElements.original[0]?.weightedValue} />
                    ))}
                  </TooltipProvider>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
        <DrawerFooter className='flex flex-row justify-between gap-2'>
          <Link passHref href={`/maps/${selectedItem.id}`} className='w-[calc(50%-0.25rem)]'>
            <Button 
              type="button" 
              disabled={isPending}
              className='w-full'
              onClick={() => {
                startTransition(() => {
                  setSelectedItem(null)
                })
              }}
            >
              {isPending ? <Loader size={16} className="animate-spin" /> : "Перейти"}
            </Button>
          </Link>
          <DrawerClose asChild>
            <Button 
              type="button" 
              variant="outline" 
              disabled={isPending}
              className='w-[calc(50%-0.25rem)]'
            >
              Закрыть
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ElementBadge({
  element,
  index,
  maxValue
}: {
  element: MaxValue<Profitability>
  index: number,
  maxValue: number | undefined,
}) {
  if (!maxValue) return null;

  const coficience = (100/maxValue) * element.weightedValue

  return (
    <TooltipClick 
      triggerAsChild
      trigger={
        <Badge 
          className='relative p-0 px-0.5 h-fit min-h-3 rounded-sm shadow transition-all duration-300'
          style={{
            fontSize: 16 - index*1.25,
            height: coficience < 50 ? `calc(100%/${index+1})` : `${coficience}%`,
            borderColor: `hsl(var(--border) / ${1 - index*0.25})`,
            backgroundColor: `hsl(var(--primary) / ${1 - index*0.15})`,
          }}
        >
          {idToSentenceCase(element.key)}
        </Badge>
      } 
      classNameContent='z-[200]'
    >
      {element.originalValue}
    </TooltipClick>
  )
}