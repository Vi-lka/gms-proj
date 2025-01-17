import { type Table } from '@tanstack/react-table'
import React from 'react'
import { DataTableSortList } from '~/components/data-table/data-table-sort-list'
import { type AreasDataExtend } from '~/server/db/schema'
import DeleteAreasDataDialog from './delete-areas-data-dialog'
import CreateAreasDataSheet from './create-areas-data-sheet'

interface AreasDataTableToolbarActionsProps {
  table: Table<AreasDataExtend>
}

export default function AreasDataTableToolbarActions({
  table
}: AreasDataTableToolbarActionsProps) {
  const [openCreate, setOpenCreate] = React.useState(false)

  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteAreasDataDialog
          areasData={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <CreateAreasDataSheet open={openCreate} onOpenChange={setOpenCreate} />
      <DataTableSortList table={table}/>
    </div>
  )
}
