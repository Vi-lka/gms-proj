import { type Table } from '@tanstack/react-table'
import React from 'react'
import { DataTableSortList } from '~/components/data-table/data-table-sort-list'
import { type LicensedAreasExtend } from '~/server/db/schema'
import DeleteLicensedAreasDialog from './delete-licensed-areas-dialog'
import CreateLicensedAreaSheet from './create-licensed-area-sheet'

interface LicensedAreasTableToolbarActionsProps {
  table: Table<LicensedAreasExtend>
}

export default function LicensedAreasTableToolbarActions({
  table
}: LicensedAreasTableToolbarActionsProps) {
  const [openCreate, setOpenCreate] = React.useState(false)

  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteLicensedAreasDialog
          licensedAreas={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <CreateLicensedAreaSheet open={openCreate} onOpenChange={setOpenCreate} />
      <DataTableSortList table={table}/>
    </div>
  )
}
