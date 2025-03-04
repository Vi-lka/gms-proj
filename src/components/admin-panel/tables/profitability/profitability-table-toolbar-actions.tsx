import { type Table } from "@tanstack/react-table"
import React from "react"
import { type Profitability } from "~/server/db/schema"
import CreateProfitabilitySheet from "./create-profitability-sheet"

interface ProfitabilityTableToolbarActionsProps {
  table: Table<Profitability>
}

export default function CompaniesTableToolbarActions({
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
      {table.getRowCount() === 0 && <CreateProfitabilitySheet open={openCreate} onOpenChange={setOpenCreate} />}
    </div>
  )
}
