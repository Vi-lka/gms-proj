"use client"

import React from 'react'
import { type DataTableFilterField, type DataTableRowAction } from '~/lib/types'
import { type LicensedAreaExtend } from '~/server/db/schema'
import { type getLicensedAreas } from '~/server/queries/licensed-areas'
import { getColumns } from './licensed-areas-columns'
import { useDataTable } from '~/hooks/use-data-table'
import { DataTable } from '~/components/data-table/data-table'
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar'
import LicensedAreasTableToolbarActions from './licensed-areas-table-toolbar-actions'
import DeleteLicensedAreasDialog from './delete-licensed-areas-dialog'
import UpdateLicensedAreaSheet from './update-licensed-area-sheet'
import { toast } from 'sonner'

interface LicensedAreasTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getLicensedAreas>>,
    ]
  >
}

export default function LicensedAreasTable({ promises }: LicensedAreasTableProps) {
  const [{ data, pageCount, error }] = React.use(promises)

  React.useEffect(() => {
    if (error !== null) toast.error(error, { id: "data-error", duration: 5000, dismissible: true })
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  const [isPending, startTransition] = React.useTransition()

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<LicensedAreaExtend> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const filterFields: DataTableFilterField<LicensedAreaExtend>[] = [
    {
      id: "name",
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
      sorting: [{ id: "name", desc: false }],
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
          <LicensedAreasTableToolbarActions table={table} disabled={isPending} />
        </DataTableToolbar>
      </DataTable>
      <UpdateLicensedAreaSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        licensedArea={rowAction?.row.original ?? null}
      />
      <DeleteLicensedAreasDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        licensedAreas={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  )
}
