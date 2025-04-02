"use client"

import React from "react";
import type { DataTableFilterField, DataTableRowAction } from "~/lib/types";
import type { getSessionRolesCounts, getSessions } from "~/server/queries/users";
import { getColumns } from "./sessions-table-columns";
import { type SessionExtend, users } from "~/server/db/schema";
import { toSentenceCase } from "~/lib/utils";
import { useDataTable } from "~/hooks/use-data-table";
import { DataTable } from "~/components/data-table/data-table";
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar";
import { DataTableSortList } from "~/components/data-table/data-table-sort-list";
import { toast } from "sonner";
import DeleteSessionsDialog from "./delete-sessions-dialog";
import { errorToast } from "~/components/ui/special/error-toast";

interface SessionsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getSessions>>,
      Awaited<ReturnType<typeof getSessionRolesCounts>>,
    ]
  >
}

export default function SessionsTable({ promises }: SessionsTableProps) {
  const [{ data, pageCount, error }, roleCounts] = React.use(promises)

  React.useEffect(() => {
    if (error !== null) errorToast(error, {id: "data-error"})
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  const [isPending, startTransition] = React.useTransition()

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<SessionExtend> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const filterFields: DataTableFilterField<SessionExtend>[] = [
    {
      id: "name",
      label: "Имя",
      placeholder: "Поиск...",
    },
    {
      id: "role",
      label: "Роль",
      options: users.role.enumValues.map((role) => ({
        label: toSentenceCase(role),
        value: role,
        count: roleCounts[role],
      }))
    }
  ]

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: false,
    initialState: {
      sorting: [{ id: "name", desc: false }],
      columnPinning: { 
        right: ["actions"],
        left: ["select"]
      },
    },
    getRowId: (originalRow, index) => `${originalRow.userId}-${index}`,
    shallow: false,
    startTransition,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable table={table} disabled={isPending}>
        <DataTableToolbar table={table} filterFields={filterFields} isPending={isPending}>
          <div className="flex items-center gap-2">
            {table.getFilteredSelectedRowModel().rows.length > 0 ? (
              <DeleteSessionsDialog
                sessions={table
                  .getFilteredSelectedRowModel()
                  .rows.map((row) => row.original)}
                onSuccess={() => table.toggleAllRowsSelected(false)}
              />
            ) : null}
            <DataTableSortList table={table} disabled={isPending}/>
          </div>
        </DataTableToolbar>
      </DataTable>
      <DeleteSessionsDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        sessions={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  )
}
