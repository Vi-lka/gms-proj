"use client"

import React from 'react'
import { type DataTableFilterField, type DataTableRowAction } from '~/lib/types';
import { type FieldExtend } from '~/server/db/schema';
import { type getFields } from '~/server/queries/fields'
import { getColumns } from './fields-table-columns';
import { useDataTable } from '~/hooks/use-data-table';
import { DataTable } from '~/components/data-table/data-table';
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar';
import FieldsTableToolbarActions from './fields-table-toolbar-actions';
import UpdateFieldSheet from './update-field-sheet';
import DeleteFieldsDialog from './delete-fields-dialog';
import { toast } from 'sonner';

interface FieldsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getFields>>,
    ]
  >
}

export default function FieldsTable({ promises }: FieldsTableProps) {
  const [{ data, pageCount, error }] = React.use(promises)

  React.useEffect(() => {
    if (error !== null) toast.error(error, { id: "data-error", duration: 5000, dismissible: true })
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  const [isPending, startTransition] = React.useTransition()

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<FieldExtend> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const filterFields: DataTableFilterField<FieldExtend>[] = [
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
          <FieldsTableToolbarActions table={table} disabled={isPending} />
        </DataTableToolbar>
      </DataTable>
      <UpdateFieldSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        field={rowAction?.row.original ?? null}
      />
      <DeleteFieldsDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        fields={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  )
}
