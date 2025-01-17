"use client"

import React from 'react'
import { type DataTableFilterField, type DataTableRowAction } from '~/lib/types'
import { type AreasDataExtend } from '~/server/db/schema'
import { type getAreasData } from '~/server/queries/area-data'
import { getColumns } from './areas-data-colunms'
import { useDataTable } from '~/hooks/use-data-table'
import { DataTable } from '~/components/data-table/data-table'
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar'
import AreasDataTableToolbarActions from './areas-data-table-toolbar-actions'
import DeleteAreasDataDialog from './delete-areas-data-dialog'
import UpdateAreasDataSheet from './update-areas-data-sheet'

interface AreasDataTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getAreasData>>,
    ]
  >
}

export default function AreasDataTable({ promises }: AreasDataTableProps) {
  const [{ data, pageCount }] = React.use(promises)

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<AreasDataExtend> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const filterFields: DataTableFilterField<AreasDataExtend>[] = [
    {
      id: "areaName",
      label: "Название",
      placeholder: "Поиск...",
    }
  ]

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: false,
    initialState: {
      columnPinning: { 
        right: ["actions"],
        left: ["select"]
      },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable
        table={table}
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <AreasDataTableToolbarActions table={table} />
        </DataTableToolbar>
      </DataTable>
      <UpdateAreasDataSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        areaData={rowAction?.row.original ?? null}
      />
      <DeleteAreasDataDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        areasData={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  )
}
