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

interface LicensedAreasTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getLicensedAreas>>,
    ]
  >
}

export default function LicensedAreasTable({ promises }: LicensedAreasTableProps) {
  const [{ data, pageCount }] = React.use(promises)

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
          <LicensedAreasTableToolbarActions table={table} />
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
