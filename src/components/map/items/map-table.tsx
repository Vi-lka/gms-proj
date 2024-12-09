"use client"

import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { cn } from '~/lib/utils'
import { ArrowRightFromLine } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useRef, useState } from 'react'
import { ReactSVG } from 'react-svg'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import TooltipMouse from '~/components/ui/special/TooltipMouse'

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
  },
]

export default function MapTable({
  svg,
  className
}: {
  svg: string,
  className?: string
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
    <div 
      // ref={ref}
      className={cn('w-full flex justify-center items-center', className)}
    >
      <TooltipMouse open={tooltip} description='Название'>
        <TransformWrapper 
          wheel={{
            smoothStep: 0.0007
          }}
          maxScale={3}
        >
          <TransformComponent
            wrapperClass='bg-accent'
            contentStyle={{
              width: "100vw",
              height: "100vh",
              margin: "0 auto",
            }}
          >
            <ReactSVG
              src={`/svg/${svg}.svg`}
              loading={() => <span>Loading</span>}
              fallback={() => <span>Error!</span>}
              evalScripts="always"
              beforeInjection={(svg) => {
                addEventListenerAll(Array.from(svg.children))
                svg.setAttribute("class", "w-full h-[90vh] mx-auto")
              }}
              className="w-full h-full flex items-center justify-center cursor-move"
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
      <Dialog open={dialogOpen} onOpenChange={handleDialog}>
        <DialogContent className='w-5/6 h-5/6 max-w-7xl flex flex-col overflow-hidden'>
          <DialogHeader>
            <DialogTitle>Заголовок</DialogTitle>
            <DialogDescription>
              Описание. Описание. Описание. Описание. Описание.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className='h-full'>
            <div className=' flex items-center justify-center w-full h-full'>
              <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                      <TableCell className="font-medium">{invoice.invoice}</TableCell>
                      <TableCell>{invoice.paymentStatus}</TableCell>
                      <TableCell>{invoice.paymentMethod}</TableCell>
                      <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">$2,500.00</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </ScrollArea>
          <div className='flex w-full justify-end'>
            <Link href={``} passHref>
              <Button className=''>
                Перейти <ArrowRightFromLine />
              </Button>
            </Link>
          </div>
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
  )
}