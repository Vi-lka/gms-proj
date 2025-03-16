"use client"

import React from 'react'
import type { DataTableFilterField, DataTableRowAction } from '~/lib/types'
import { users, type User } from '~/server/db/schema'
import type { getUserRolesCounts, getUsers } from '~/server/queries/users'
import { getColumns } from './users-table-columns'
import { idToSentenceCase } from '~/lib/utils'
import { useDataTable } from '~/hooks/use-data-table'
import { DataTable } from '~/components/data-table/data-table'
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar'
import { DataTableSortList } from '~/components/data-table/data-table-sort-list'
import { toast } from 'sonner'

interface UsersTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getUsers>>,
      Awaited<ReturnType<typeof getUserRolesCounts>>,
    ]
  >
}

export default function UsersTable({ promises }: UsersTableProps) {
  const [{ data, pageCount, error }, roleCounts] = React.use(promises)

  React.useEffect(() => {
    if (error !== null) toast.error(error, { id: "data-error", duration: 5000, dismissible: true })
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  const [isPending, startTransition] = React.useTransition()

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
        label: idToSentenceCase(role),
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
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    startTransition,
    clearOnDefault: true,
  })


  return (
    <>
      <DataTable table={table} disabled={isPending}>
        <DataTableToolbar table={table} filterFields={filterFields} isPending={isPending}>
          {/*TODO:  <UsersTableToolbarActions table={table} /> */}
          <DataTableSortList table={table} disabled={isPending}/>
        </DataTableToolbar>
      </DataTable>
    </>
  )
}
