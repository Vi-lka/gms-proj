import { type Table } from "@tanstack/react-table";
import { DataTableSortList } from "~/components/data-table/data-table-sort-list";
import { type Company } from "~/server/db/schema";
import DeleteCompaniesDialog from "./delete-companies-dialog";
import CreateCompanySheet from "./create-company-sheet";
import React from "react";

interface CompaniesTableToolbarActionsProps {
  table: Table<Company>
}

export default function CompaniesTableToolbarActions({
  table
}: CompaniesTableToolbarActionsProps) {
  const [openCreate, setOpenCreate] = React.useState(false)
  
  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteCompaniesDialog
          companies={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <CreateCompanySheet open={openCreate} onOpenChange={setOpenCreate} />
      <DataTableSortList table={table}/>
    </div>
  )
}
