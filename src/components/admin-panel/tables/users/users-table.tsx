"use client"

import React from 'react'
import type { DataTableFilterField, DataTableRowAction } from '~/lib/types'
import { users, type User } from '~/server/db/schema'
import type { getUserRolesCounts, getUsers } from '~/server/queries/users'
import { getColumns } from './users-table-columns'
import { toSentenceCase } from '~/lib/utils'
import { useDataTable } from '~/hooks/use-data-table'
import { DataTable } from '~/components/data-table/data-table'
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar'

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

  const [, setRowAction] = React.useState<DataTableRowAction<User> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const filterFields: DataTableFilterField<User>[] = [
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
      sorting: [{ id: "id", desc: true }],
      columnPinning: { 
        right: ["actions"],
        left: ["select"]
      },
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
        <DataTableToolbar table={table} filterFields={filterFields}>
          {/* <UsersTableToolbarActions table={table} /> */}
        </DataTableToolbar>
      </DataTable>
    </>
  )
}
