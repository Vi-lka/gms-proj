"use client"

import React from 'react'
import { type DataTableAdvancedFilterField, type DataTableRowAction } from '~/lib/types'
import { users, type User } from '~/server/db/schema'
import { type getUserRolesCounts, type getUsers } from '~/server/queries/users'
import { getColumns } from './users-table-columns'
import { toSentenceCase } from '~/lib/utils'
import { useDataTable } from '~/hooks/use-data-table'
import { DataTable } from '~/components/data-table/data-table'
import { DataTableAdvancedToolbar } from '~/components/data-table/data-table-advanced-toolbar'


interface UsersTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getUsers>>,
      Awaited<ReturnType<typeof getUserRolesCounts>>,
    ]
  >
}

export default function UsersTable({ promises }: UsersTableProps) {
  const [{ data, pageCount }, roleCounts] = React.use(promises)

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<User> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const advancedFilterFields: DataTableAdvancedFilterField<User>[] = [
    {
      id: "name",
      label: "Имя",
      type: "text",
    },
    {
      id: "role",
      label: "Роль",
      type: "multi-select",
      options: users.role.enumValues.map((role) => ({
        label: toSentenceCase(role),
        value: role,
        count: roleCounts[role],
      })),
    }
  ]

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter: true,
    initialState: {
      sorting: [{ id: "id", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    clearOnDefault: true,
  })


  return (
    <>
      <DataTable
        table={table}
        // floatingBar={<UsersTableFloatingBar table={table} />}
      >
        <DataTableAdvancedToolbar
          table={table}
          filterFields={advancedFilterFields}
          shallow={false}
        >
          {/* <UsersTableToolbarActions table={table} /> */}
        </DataTableAdvancedToolbar>
      </DataTable>
      {/* <UpdateTaskSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        task={rowAction?.row.original ?? null}
      /> */}
      {/* <DeleteUserDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        tasks={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      /> */}
    </>
  )
}
