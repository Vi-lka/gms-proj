"use client"

import React from 'react'
import { type DataTableFilterField, type DataTableRowAction } from '~/lib/types'
import { type FieldMapWithUrl } from '~/server/db/schema'
import { type getCompanyFieldsMapsCounts, type getFieldMapsCounts, type getFieldsMaps } from '~/server/queries/fields-maps'
import { type getAllCompanies } from '~/server/queries/companies'
import { type getAllFields } from '~/server/queries/fields'
import { getColumns } from './fields-maps-columns'
import { useRouter } from 'next/navigation'
import { useDataTable } from '~/hooks/use-data-table'
import { DataTable } from '~/components/data-table/data-table'
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar'
import DeleteFieldsMapsDialog from './delete-fields-maps-dialog'
import FieldsMapsTableToolbarActions from './fields-maps-table-toolbar-actions'
import OpenImageDialog from './open-image-dialog'
import { toast } from 'sonner'
import { idToSentenceCase } from '~/lib/utils'

interface FieldsMapsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getFieldsMaps>>,
      Awaited<ReturnType<typeof getCompanyFieldsMapsCounts>>,
      Awaited<ReturnType<typeof getFieldMapsCounts>>,
      Awaited<ReturnType<typeof getAllCompanies>>,
      Awaited<ReturnType<typeof getAllFields>>,
    ]
  >
}

export default function FieldsMapsTable({ promises }: FieldsMapsTableProps) {
  const [
    { data, pageCount, error },
    companyCounts,
    fieldCounts,
    { data: allCompanies, error: errorCompanies },
    { data: allFields, error: errorFields },
  ] = React.use(promises)

  React.useEffect(() => {
    if (error !== null) toast.error(error, { id: "data-error", duration: 5000, dismissible: true })
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  React.useEffect(() => {
    if (errorCompanies !== null) toast.error(errorCompanies, { id: "companies-data-error", duration: 5000, dismissible: true })
    return () => { 
      if (errorCompanies !== null) toast.dismiss("companies-data-error")
    }
  }, [errorCompanies])

  React.useEffect(() => {
    if (errorFields !== null) toast.error(errorFields, { id: "fields-data-error", duration: 5000, dismissible: true })
    return () => { 
      if (errorFields !== null) toast.dismiss("fields-data-error")
    }
  }, [errorFields])

  const [isPending, startTransition] = React.useTransition()

  const router = useRouter()

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<FieldMapWithUrl> | null>(null);

  const goToUpdate = React.useCallback((id: string) => {
    router.push(`/dashboard/fmaps/${id}`)
  }, [router])

  const columns = React.useMemo(
    () => getColumns({ setRowAction, goToUpdate }),
    [setRowAction, goToUpdate]
  )

  let filterFields: DataTableFilterField<FieldMapWithUrl>[] = [
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
      sorting: [{ id: "fieldName", desc: false }],
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
          <FieldsMapsTableToolbarActions table={table} disabled={isPending} />
        </DataTableToolbar>
      </DataTable>
      <DeleteFieldsMapsDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        fieldsMaps={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
      <OpenImageDialog
        open={rowAction?.type === "dialog"}
        onOpenChange={() => setRowAction(null)}
        row={rowAction?.row}
        showTrigger={false}
      />
    </>
  )
}
