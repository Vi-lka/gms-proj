"use client"

import React from 'react'
import { type DataTableFilterField, type DataTableRowAction } from '~/lib/types'
import { type AreaDataExtend } from '~/server/db/schema'
import { type getAreasData } from '~/server/queries/area-data'
import { getColumns } from './areas-data-colunms'
import { useDataTable } from '~/hooks/use-data-table'
import { DataTable } from '~/components/data-table/data-table'
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar'
import AreasDataTableToolbarActions from './areas-data-table-toolbar-actions'
import DeleteAreasDataDialog from './delete-areas-data-dialog'
import UpdateAreasDataSheet from './update-areas-data-sheet'
import { toast } from 'sonner'

interface AreasDataTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getAreasData>>,
    ]
  >
}

export default function AreasDataTable({ promises }: AreasDataTableProps) {
  const [{ data, pageCount, error }] = React.use(promises)

  React.useEffect(() => {
    if (error !== null) toast.error(error, { id: "data-error", duration: 5000, dismissible: true })
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  const [isPending, startTransition] = React.useTransition()

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<AreaDataExtend> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const filterFields: DataTableFilterField<AreaDataExtend>[] = [
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
      sorting: [{ id: "companyName", desc: false }],
      columnPinning: { 
        right: ["actions"],
        left: ["select"]
      },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    startTransition,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable table={table} disabled={isPending}>
        <DataTableToolbar table={table} filterFields={filterFields} isPending={isPending}>
          <AreasDataTableToolbarActions table={table} disabled={isPending} />
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
