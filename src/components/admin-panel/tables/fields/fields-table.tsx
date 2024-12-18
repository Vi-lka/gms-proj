"use client"

import React from 'react'
import { type DataTableFilterField, type DataTableRowAction } from '~/lib/types';
import { type FieldsExtend } from '~/server/db/schema';
import { type getFields } from '~/server/queries/fields'
import { getColumns } from './fields-table-columns';
import { useDataTable } from '~/hooks/use-data-table';
import { DataTable } from '~/components/data-table/data-table';
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar';
import FieldsTableToolbarActions from './fields-table-toolbar-actions';
import UpdateFieldSheet from './update-field-sheet';
import DeleteFieldsDialog from './delete-fields-dialog';

interface FieldsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getFields>>,
    ]
  >
}

export default function FieldsTable({ promises }: FieldsTableProps) {
  const [{ data, pageCount }] = React.use(promises)

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<FieldsExtend> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const filterFields: DataTableFilterField<FieldsExtend>[] = [
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
      columnPinning: { right: ["actions"] },
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
          <FieldsTableToolbarActions table={table} />
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
