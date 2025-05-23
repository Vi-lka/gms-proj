import { type Table } from "@tanstack/react-table"
import React from "react"
import { type MapDataExtend } from "~/server/db/schema"
import CreateMapSheet from "./create-map-sheet"

interface ProfitabilityTableToolbarActionsProps {
  table: Table<MapDataExtend>
}

export default function MapsTableToolbarActions({
  table
}: ProfitabilityTableToolbarActionsProps) {
  const [openCreate, setOpenCreate] = React.useState(false)
  
  return (
    <div className="flex items-center gap-2">
      {/* {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteProfitabilityDialog
          companies={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null} */}
      {table.getRowCount() === 0 && <CreateMapSheet open={openCreate} onOpenChange={setOpenCreate} />}
    </div>
  )
}
