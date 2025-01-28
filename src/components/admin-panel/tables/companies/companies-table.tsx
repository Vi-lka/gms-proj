"use client"

import React from 'react'
import { type DataTableFilterField, type DataTableRowAction } from '~/lib/types';
import { type Company } from '~/server/db/schema';
import { type getCompanies } from '~/server/queries/companies'
import { getColumns } from './companies-table-columns';
import { useDataTable } from '~/hooks/use-data-table';
import { DataTable } from '~/components/data-table/data-table';
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar';
import CompaniesTableToolbarActions from './companies-table-toolbar-actions';
import DeleteCompaniesDialog from './delete-companies-dialog';
import UpdateCompanySheet from './update-company-sheet';

interface CompaniesTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getCompanies>>,
    ]
  >
}

export default function CompaniesTable({ promises }: CompaniesTableProps) {
  const [{ data, pageCount }] = React.use(promises)

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<Company> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )
  
  const filterFields: DataTableFilterField<Company>[] = [
    {
      id: "name",
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
      >
        <DataTableToolbar table={table} filterFields={filterFields}>
          <CompaniesTableToolbarActions table={table} />
        </DataTableToolbar>
      </DataTable>
      <UpdateCompanySheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        company={rowAction?.row.original ?? null}
      />
      <DeleteCompaniesDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        companies={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  )
}
