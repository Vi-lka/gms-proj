import { type Table } from "@tanstack/react-table";
import { DataTableSortList } from "~/components/data-table/data-table-sort-list";
import { type FileDBWithUrl } from "~/server/db/schema";
import React from "react";
import DeleteFilesDialog from "./delete-files-dialog";
import CreateFileSheet from "./create-file-sheet";

interface FilesTableToolbarActionsProps {
  table: Table<FileDBWithUrl>
  disabled?: boolean
}

export default function FilesTableToolbarActions({
  table,
  disabled
}: FilesTableToolbarActionsProps) {
  const [openCreate, setOpenCreate] = React.useState(false)
  
  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteFilesDialog
          files={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <CreateFileSheet open={openCreate} onOpenChange={setOpenCreate} />
      <DataTableSortList table={table} disabled={disabled}/>
    </div>
  )
}
