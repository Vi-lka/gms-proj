"use client"

import React from 'react'
import { type DataTableFilterField, type DataTableRowAction } from '~/lib/types';
import { type FieldExtend } from '~/server/db/schema';
import { type getCompanyFieldsCounts, type getFields } from '~/server/queries/fields'
import { getColumns } from './fields-table-columns';
import { useDataTable } from '~/hooks/use-data-table';
import { DataTable } from '~/components/data-table/data-table';
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar';
import FieldsTableToolbarActions from './fields-table-toolbar-actions';
import UpdateFieldSheet from './update-field-sheet';
import DeleteFieldsDialog from './delete-fields-dialog';
import { toast } from 'sonner';
import { type getAllCompanies } from '~/server/queries/companies';
import { idToSentenceCase } from '~/lib/utils';
import { errorToast } from '~/components/ui/special/error-toast';

interface FieldsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getFields>>,
      Awaited<ReturnType<typeof getCompanyFieldsCounts>>,
      Awaited<ReturnType<typeof getAllCompanies>>
    ]
  >
}

export default function FieldsTable({ promises }: FieldsTableProps) {
  const [
    { data, pageCount, error }, 
    companyCounts, 
    { data: allCompanies, error: errorCompanies }, 
  ] = React.use(promises)

  React.useEffect(() => {
    if (error !== null) errorToast(error, {id: "data-error"})
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  React.useEffect(() => {
    if (errorCompanies !== null) errorToast(errorCompanies, {id: "companies-data-error"})
    return () => { 
      if (errorCompanies !== null) toast.dismiss("companies-data-error")
    }
  }, [errorCompanies])

  const [isPending, startTransition] = React.useTransition()

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<FieldExtend> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  let filterFields: DataTableFilterField<FieldExtend>[] = [
    {
      id: "name",
      label: "Название",
      placeholder: "Поиск...",
    },
  ]

  if (errorCompanies === null) {
    filterFields = [
      ...filterFields,
      {
        id: "companyName",
        label: idToSentenceCase("companyName"),
        options: allCompanies.map(({id, name}) => ({
          label: name,
          value: id,
          count: companyCounts[id],
        }))
      }
    ]
  }

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
          <FieldsTableToolbarActions table={table} disabled={isPending} />
        </DataTableToolbar>
      </DataTable>
      <UpdateFieldSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        field={rowAction?.row.original ?? null}
      />
      <DeleteFieldsDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        fields={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  )
}
