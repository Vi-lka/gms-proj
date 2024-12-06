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

interface SessionsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getSessions>>,
      Awaited<ReturnType<typeof getSessionRolesCounts>>,
    ]
  >
}

export default function SessionsTable({ promises }: SessionsTableProps) {
  const [{ data, pageCount }, roleCounts] = React.use(promises)

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
      sorting: [{ id: "userId", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow, index) => `${originalRow.userId}-${index}`,
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable
        table={table}
        // floatingBar={<UsersTableFloatingBar table={table} />}
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          {/* <UsersTableToolbarActions table={table} /> */}
        </DataTableToolbar>
      </DataTable>
    </>
  )
}
