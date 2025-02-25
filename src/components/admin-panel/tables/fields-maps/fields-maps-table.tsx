"use client"

import React from 'react'
import { type DataTableFilterField, type DataTableRowAction } from '~/lib/types'
import { type FieldMapExtend } from '~/server/db/schema'
import { type getFieldsMaps } from '~/server/queries/fields-maps'
import { getColumns } from './fields-maps-columns'
import { useRouter } from 'next/navigation'
import { useDataTable } from '~/hooks/use-data-table'
import { DataTable } from '~/components/data-table/data-table'
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar'
import DeleteFieldsMapsDialog from './delete-fields-maps-dialog'
import FieldsMapsTableToolbarActions from './fields-maps-table-toolbar-actions'
import OpenImageDialog from './open-image-dialog'

interface FieldsMapsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getFieldsMaps>>,
    ]
  >
}

export default function FieldsMapsTable({ promises }: FieldsMapsTableProps) {
  const [{ data, pageCount }] = React.use(promises)

  const router = useRouter()

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<FieldMapExtend> | null>(null);

  const goToUpdate = React.useCallback((id: string) => {
    router.push(`/dashboard/fmaps/${id}`)
  }, [router])

  const columns = React.useMemo(
    () => getColumns({ setRowAction, goToUpdate }),
    [setRowAction, goToUpdate]
  )
  
  const filterFields: DataTableFilterField<FieldMapExtend>[] = [
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
          <FieldsMapsTableToolbarActions table={table} />
        </DataTableToolbar>
      </DataTable>
      <DeleteFieldsMapsDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        fieldsMaps={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
      <OpenImageDialog
        open={rowAction?.type === "dialog"}
        onOpenChange={() => setRowAction(null)}
        row={rowAction?.row}
        showTrigger={false}
      />
    </>
  )
}
