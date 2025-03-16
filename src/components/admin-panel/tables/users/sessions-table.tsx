"use client"

import React from "react";
import type { DataTableFilterField, DataTableRowAction, SessionWithUser } from "~/lib/types";
import type { getSessionRolesCounts, getSessions } from "~/server/queries/users";
import { getColumns } from "./sessions-table-columns";
import { users } from "~/server/db/schema";
import { toSentenceCase } from "~/lib/utils";
import { useDataTable } from "~/hooks/use-data-table";
import { DataTable } from "~/components/data-table/data-table";
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar";
import { DataTableSortList } from "~/components/data-table/data-table-sort-list";
import { toast } from "sonner";

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
    if (error !== null) toast.error(error, { id: "data-error", duration: 5000, dismissible: true })
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  const [isPending, startTransition] = React.useTransition()

  const [, setRowAction] = React.useState<DataTableRowAction<SessionWithUser> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const filterFields: DataTableFilterField<SessionWithUser>[] = [
    {
      id: "name",
      label: "Имя",
      placeholder: "Поиск по имени или ID...",
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
          <DataTableSortList table={table} disabled={isPending}/>
        </DataTableToolbar>
      </DataTable>
    </>
  )
}
