import React from 'react'
import { type Table } from '@tanstack/react-table'
import { type FieldExtend } from '~/server/db/schema'
import { DataTableSortList } from '~/components/data-table/data-table-sort-list'
import CreateFieldSheet from './create-field-sheet'
import DeleteFieldsDialog from './delete-fields-dialog'

interface FieldsTableToolbarActionsProps {
  table: Table<FieldExtend>
  disabled?: boolean
}

export default function FieldsTableToolbarActions({
  table,
  disabled
}: FieldsTableToolbarActionsProps) {
  const [openCreate, setOpenCreate] = React.useState(false)

  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteFieldsDialog
          fields={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <CreateFieldSheet open={openCreate} onOpenChange={setOpenCreate} />
      <DataTableSortList table={table} disabled={disabled}/>
    </div>
  )
}