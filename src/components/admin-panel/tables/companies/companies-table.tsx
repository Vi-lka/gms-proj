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
import { toast } from 'sonner';
import { errorToast } from '~/components/ui/special/error-toast';

interface CompaniesTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getCompanies>>,
    ]
  >
}

export default function CompaniesTable({ promises }: CompaniesTableProps) {
  const [{ data, pageCount, error }] = React.use(promises)

  React.useEffect(() => {
    if (error !== null) errorToast(error, {id: "data-error"})
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  const [isPending, startTransition] = React.useTransition()

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
          <CompaniesTableToolbarActions table={table} disabled={isPending} />
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
