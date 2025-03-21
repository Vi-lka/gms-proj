"use client"

import React from "react";
import { toast } from "sonner";
import type { DataTableFilterField, DataTableRowAction } from "~/lib/types";
import { type FileDBExtend } from "~/server/db/schema";
import { type getFiles } from "~/server/queries/files";
import { getColumns } from "./files-table-columns";
import { useDataTable } from "~/hooks/use-data-table";
import { DataTable } from "~/components/data-table/data-table";
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar";
import FilesTableToolbarActions from "./files-table-toolbar-actions";
import DeleteFilesDialog from "./delete-files-dialog";
import OpenImageDialog from "./open-image-dialog";

interface FilesTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getFiles>>,
    ]
  >
}

export default function FilesTable({ promises }: FilesTableProps) {
  const [{ data, pageCount, error }] = React.use(promises)

  React.useEffect(() => {
    if (error !== null) toast.error(error, { id: "data-error", duration: 5000, dismissible: true })
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  const [isPending, startTransition] = React.useTransition()

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<FileDBExtend> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const filterFields: DataTableFilterField<FileDBExtend>[] = [
    {
      id: "fileName",
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
      sorting: [{ id: "originalName", desc: false }],
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
          <FilesTableToolbarActions table={table} disabled={isPending} />
        </DataTableToolbar>
      </DataTable>
      <DeleteFilesDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        files={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
      <OpenImageDialog
        open={rowAction?.type === "dialog"}
        onOpenChange={() => setRowAction(null)}
        row={rowAction?.row}
        showTrigger={false}
      />
    </>
  )
}