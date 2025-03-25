import * as React from "react"
import { flexRender, type Table as TanstackTable } from "@tanstack/react-table"

import { getCommonPinningStyles } from "~/lib/data-table-func"
import { cn } from "~/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { DataTablePagination } from "~/components/data-table/data-table-pagination"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type TanstackTable<TData>
   */
  table: TanstackTable<TData>

  /**
   * The floating bar to render at the bottom of the table on row selection.
   * @default null
   * @type React.ReactNode | null
   * @example floatingBar={<TasksTableFloatingBar table={table} />}
   */
  floatingBar?: React.ReactNode | null,

  scrollAreaClassName?: string

  disabled?: boolean

  isLoading?: boolean
}

export function DataTable<TData>({
  table,
  floatingBar = null,
  children,
  className,
  scrollAreaClassName,
  isLoading,
  disabled,
  ...props
}: DataTableProps<TData>) {
  return (
    <div
      className={cn("relative w-full space-y-2.5", className)}
      {...props}
    >
      {children}
      <div className="overflow-hidden rounded-md border">
        <ScrollArea type="always" classNameViewport={cn("", scrollAreaClassName)} classNameBar="z-50">
          <Table inScrollArea>
            <TableHeader inScrollArea>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          ...getCommonPinningStyles({ column: header.column }),
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className={cn("transition-all duration-300", disabled ? "opacity-70" : "opacity-100")}>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            ...getCommonPinningStyles({ column: cell.column }),
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={table.getAllColumns().length}
                      className="h-24 text-left"
                    >
                      {isLoading ? "Загрузка..." : "Нет результатов."}
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" className="z-50" />
        </ScrollArea>
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
      </div>
    </div>
  )
}
