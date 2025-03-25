import { type Table } from '@tanstack/react-table'
import React from 'react'
import { type AreaDataExtend } from '~/server/db/schema'
import DeleteAreasDataDialog from './delete-areas-data-dialog'
import CreateAreasDataSheet from './create-areas-data-sheet'

interface AreasDataTableToolbarActionsProps {
  table: Table<AreaDataExtend>
  disabled?: boolean
}

export default function AreasDataTableToolbarActions({
  table,
  // disabled
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
    </div>
  )
}
