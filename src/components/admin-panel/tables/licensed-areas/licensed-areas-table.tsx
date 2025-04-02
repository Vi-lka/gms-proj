"use client"

import React from 'react'
import { type DataTableFilterField, type DataTableRowAction } from '~/lib/types'
import { type LicensedAreaExtend } from '~/server/db/schema'
import { type getCompanyLicensedAreasCounts, type getFieldLicensedAreasCounts, type getLicensedAreas } from '~/server/queries/licensed-areas'
import { type getAllCompanies } from '~/server/queries/companies'
import { type getAllFields } from '~/server/queries/fields'
import { getColumns } from './licensed-areas-columns'
import { useDataTable } from '~/hooks/use-data-table'
import { DataTable } from '~/components/data-table/data-table'
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar'
import LicensedAreasTableToolbarActions from './licensed-areas-table-toolbar-actions'
import DeleteLicensedAreasDialog from './delete-licensed-areas-dialog'
import UpdateLicensedAreaSheet from './update-licensed-area-sheet'
import { toast } from 'sonner'
import { idToSentenceCase } from '~/lib/utils'
import { errorToast } from '~/components/ui/special/error-toast'

interface LicensedAreasTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getLicensedAreas>>,
      Awaited<ReturnType<typeof getCompanyLicensedAreasCounts>>,
      Awaited<ReturnType<typeof getFieldLicensedAreasCounts>>,
      Awaited<ReturnType<typeof getAllCompanies>>,
      Awaited<ReturnType<typeof getAllFields>>,
    ]
  >
}

export default function LicensedAreasTable({ promises }: LicensedAreasTableProps) {
  const [
    { data, pageCount, error },
    companyCounts,
    fieldCounts,
    { data: allCompanies, error: errorCompanies },
    { data: allFields, error: errorFields },
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

  React.useEffect(() => {
    if (errorFields !== null) errorToast(errorFields, {id: "fields-data-error"})
    return () => { 
      if (errorFields !== null) toast.dismiss("fields-data-error")
    }
  }, [errorFields])

  const [isPending, startTransition] = React.useTransition()

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<LicensedAreaExtend> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  let filterFields: DataTableFilterField<LicensedAreaExtend>[] = [
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
  if (errorFields === null) {
    filterFields = [
      ...filterFields,
      {
        id: "fieldName",
        label: idToSentenceCase("fieldName"),
        options: allFields.map(({id, name}) => ({
          label: name,
          value: id,
          count: fieldCounts[id],
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
          <LicensedAreasTableToolbarActions table={table} disabled={isPending} />
        </DataTableToolbar>
      </DataTable>
      <UpdateLicensedAreaSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        licensedArea={rowAction?.row.original ?? null}
      />
      <DeleteLicensedAreasDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        licensedAreas={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  )
}
