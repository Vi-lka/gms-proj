"use client"

import TooltipMouse from '~/components/ui/special/tooltip-mouse'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogTitle } from '~/components/ui/dialog'
import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { cn } from '~/lib/utils'
import { ArrowRightFromLine, LandPlot } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useRef, useState } from 'react'
import { ReactSVG } from 'react-svg'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { type getMapItem } from '~/server/queries/map'
import { Separator } from '~/components/ui/separator'

export default function Tables({
  svg,
  data,
  title,
  className
}: {
  svg: string,
  title: string,
  data: NonNullable<Awaited<ReturnType<typeof getMapItem>>>;
  className?: string,
}) {
  // const ref = useRef<HTMLDivElement>(null)

  const [tooltip, setTooltip] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const defaultColorRef = useRef("")

  const handleHover = useCallback((e: Event) => {
    const target = e.target as SVGPathElement
    defaultColorRef.current = target.style.fill
    target.style.fill = "red"
    target.style.cursor = "pointer"
    setTooltip(true)
  }, []);

  const handleOut = useCallback((e: Event) => {
    const target = e.target as SVGPathElement
    target.style.fill = defaultColorRef.current
    target.style.cursor = "default"
    setTooltip(false)
  }, []);

  const addEventListenerAll = useCallback((arr: Element[]) => {
    if (arr.length === 0) return;
    arr.forEach(node => {
      if (node.attributes.getNamedItem("data-hover")?.value === "hover") {
        node.setAttribute("class", "transition-all duration-300")
        node.addEventListener("mouseover", handleHover)
        node.addEventListener("mouseout", handleOut)
        node.addEventListener("click", () => {
          setDialogOpen(true)
        })
      } else {
        addEventListenerAll(Array.from(node.children))
      }
    })
  }, [handleHover, handleOut]);

  const handleDialog = (open: boolean) => {
    setDialogOpen(open)
    setTooltip(false)
  }

  // const removeEventListenerAll = useCallback((arr: Element[]) => {
  //   if (arr.length === 0) return;
  //   arr.forEach(node => {
  //     if (node.attributes.getNamedItem("data-hover")?.value === "hover") {
  //       node.removeEventListener("mouseover", handleHover)
  //       node.removeEventListener("mouseout", handleOut)
  //     } else {
  //       removeEventListenerAll(Array.from(node.children))
  //     }
  //   })
  // }, [handleHover, handleOut]);

  // useEffect(() => {
  //   const current = ref.current

  //   if (current) addEventListenerAll(Array.from(current.children));
      
  //   return () => {
  //     if (current) removeEventListenerAll(Array.from(current.children));
  //   }
  // }, [ref, addEventListenerAll, removeEventListenerAll])

  return (
    <div className="flex gap-6 justify-between mt-6">
    <div 
      // ref={ref}
      className={cn('flex justify-center items-center w-[65%] border border-foreground/10 shadow rounded-xl overflow-hidden', className)}
    >
      <TooltipMouse open={tooltip} description='Лицензионный участок 1'>
        <TransformWrapper 
          wheel={{
            smoothStep: 0.0007
          }}
          maxScale={3}
        >
          <TransformComponent
            wrapperClass='bg-accent'
            contentStyle={{
              width: "100%",
              height: "100%",
              margin: "0 auto",
            }}
          >
            <ReactSVG
              src={svg}
              loading={() => <span>Loading</span>}
              fallback={() => <span>Error!</span>}
              evalScripts="always"
              beforeInjection={(svg) => {
                addEventListenerAll(Array.from(svg.children))
                svg.setAttribute("class", "w-full h-full mx-auto")
              }}
              className="w-full h-full flex items-center justify-center cursor-move rounded-xl overflow-hidden"
              onClick={() => {
                console.log('wrapper onClick')
              }}
              onError={(error) => {
                console.error(error)
              }}
            />
          </TransformComponent>
        </TransformWrapper>
      </TooltipMouse>
      <Dialog open={dialogOpen} onOpenChange={handleDialog} modal={false}>
        <DialogContent className='w-full h-full max-w-none flex flex-col overflow-hidden'>
          <DialogHeader>
            <DialogTitle>Лицензионный участок 1</DialogTitle>
          </DialogHeader>
          <ScrollArea type='always' classNameViewport='pb-2 z-[1000]' className='z-[1000]'>
            <Table>
              <TableHeader>
                <TableRow>
                  {data.clusterId && (
                    <TableHead>Компания</TableHead>
                  )}
                  <TableHead>Месторождение</TableHead>
                  <TableHead>Лицензионный участок</TableHead>
                  <TableHead>Куст №</TableHead>
                  <TableHead>Скважина №</TableHead>
                  <TableHead>Пласт</TableHead>
                  <TableHead>Горизонт</TableHead>
                  <TableHead>Свита</TableHead>
                  <TableHead>Интервал залегания (м)</TableHead>
                  <TableHead>Дата отбора пробы</TableHead>
                  <TableHead>Дата анализа</TableHead>
                  <TableHead>№ протокола (лаборатория)</TableHead>
                  <TableHead>Ссылка на протокол</TableHead>
                  <TableHead>Шифр пробы (лаборатория)</TableHead>
                  <TableHead>pH</TableHead>
                  <TableHead>p (кг/м³)</TableHead>
                  <TableHead>Минерализация (мг/дм³)</TableHead>
                  <TableHead>Li+</TableHead>
                  <TableHead>Rb+</TableHead>
                  <TableHead>Cs+</TableHead>
                  <TableHead>B</TableHead>
                  <TableHead>I-</TableHead>
                  <TableHead>Na+</TableHead>
                  <TableHead>Ca2+</TableHead>
                  <TableHead>Mg2+</TableHead>
                  <TableHead>K+</TableHead>
                  <TableHead>Cl-</TableHead>
                  <TableHead>Br-</TableHead>
                  <TableHead>Sr2+</TableHead>
                  <TableHead>Ba2+</TableHead>
                  <TableHead>Al3+</TableHead>
                  <TableHead>Se2+</TableHead>
                  <TableHead>Si</TableHead>
                  <TableHead>Mn2+</TableHead>
                  <TableHead>Cu2+</TableHead>
                  <TableHead>Zn2+</TableHead>
                  <TableHead>Ag</TableHead>
                  <TableHead>W</TableHead>
                  <TableHead>Ti</TableHead>
                  <TableHead>V</TableHead>
                  <TableHead>Cr</TableHead>
                  <TableHead>Co</TableHead>
                  <TableHead>Ni</TableHead>
                  <TableHead>As</TableHead>
                  <TableHead>Mo</TableHead>
                  <TableHead>Pb</TableHead>
                  <TableHead>Bi</TableHead>
                  <TableHead>SO42-</TableHead>
                  <TableHead>HCO3-</TableHead>
                  <TableHead>CO32-</TableHead>
                  <TableHead>NH4+</TableHead>
                  <TableHead>F-</TableHead>
                  <TableHead>NO2-</TableHead>
                  <TableHead>NO3-</TableHead>
                  <TableHead>PO43-</TableHead>
                  <TableHead>Fe(общ)</TableHead>
                  <TableHead>Жесткость, ºЖ</TableHead>
                  <TableHead>Общая щелочность, ммоль/дм³</TableHead>
                  <TableHead>Удельная электропроводимость, мСм/см</TableHead>
                  <TableHead>Взвешенные вещества, мг/дм³</TableHead>
                  <TableHead>Сухой остаток</TableHead>
                  <TableHead>Место анализа</TableHead>
                  <TableHead>Примечание</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                {data.clusterId && (
                    <TableCell>Компания 1</TableCell>
                  )}
                  <TableCell>Месторождение 1</TableCell>
                  <TableCell>Лицензионный участок 1</TableCell>
                  <TableCell>Куст 1</TableCell>
                  <TableCell>Скважина 1</TableCell>
                  <TableCell>Пласт 1</TableCell>
                  <TableCell>Горизонт 1</TableCell>
                  <TableCell>Свита 1</TableCell>
                  <TableCell>1346-1456</TableCell>
                  <TableCell>01.04.2024</TableCell>
                  <TableCell>28.06.2024</TableCell>
                  <TableCell>379-1/24</TableCell>
                  <TableCell>https:/some-link</TableCell>
                  <TableCell>ABC</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell>3.14</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal"/>
          </ScrollArea>
          {/* <div className='flex w-full justify-end'>
            <Link href={``} passHref>
              <Button className=''>
                Перейти <ArrowRightFromLine />
              </Button>
            </Link>
          </div> */}
        </DialogContent>
      </Dialog>
      {/* 
      <Suspense fallback={<>Loading...</>}> 
        <LazySvg
          name={name}
        />
      </Suspense>
      */}
    </div>

    <div className='flex flex-col gap-4 flex-grow w-[35%]'>
      <p className='font-semibold'>{title}</p>
      {data.companiesToMapItems.length > 1 && (
        <>
          <Separator className='bg-foreground/10 shadow' />
          <div className='space-y-2'>
            {data.companiesToMapItems.map(item => (
              <p key={item.companyId}>
                {item.company.name}
              </p>
            ))}
          </div>
        </>
      )}
      <Separator className='bg-foreground/10 shadow' />
      <p>Месторождение 1</p>
      <Separator className='bg-foreground/10 shadow' />
      <div className=''>
        <p 
          className='inline-flex gap-2 cursor-pointer hover:underline'
          onClick={() => setDialogOpen(true)}
        >
          <LandPlot /> 
          <span className='flex-1'>Лицензионный участок 1</span>
        </p>
      </div>
    </div>
    </div>
  )
}