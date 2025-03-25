"use client"

import React from 'react'
import { type DataTableFilterField, type DataTableRowAction } from '~/lib/types'
import { type AreaDataExtend } from '~/server/db/schema'
import { getColumns } from './areas-data-colunms'
import { useDataTable } from '~/hooks/use-data-table'
import { DataTable } from '~/components/data-table/data-table'
import AreasDataTableToolbarActions from './areas-data-table-toolbar-actions'
import DeleteAreasDataDialog from './delete-areas-data-dialog'
import UpdateAreasDataSheet from './update-areas-data-sheet'
import { toast } from 'sonner'
import { type getCompanyAreasDataCounts, type getFieldAreasDataCounts, type getLicensedAreaDataCounts, type getAreasData } from '~/server/queries/area-data'
import { type getAllCompanies } from '~/server/queries/companies'
import { type getAllFields } from '~/server/queries/fields'
import { type getAllLicensedAreas } from '~/server/queries/licensed-areas'
import { getAdvancedFilterFields } from './areas-data-table-advanced-filter-fields'
import DataTableSearchInput from '~/components/data-table/data-table-search-input'
import { Separator } from '~/components/ui/separator'
import { DataTableAdvancedToolbar } from '~/components/data-table/data-table-advanced-toolbar'
import { DataTableFacetedFilter } from '~/components/data-table/data-table-faceted-filter'
import { idToSentenceCase } from '~/lib/utils'

interface AreasDataTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getAreasData>>,
      Awaited<ReturnType<typeof getCompanyAreasDataCounts>>,
      Awaited<ReturnType<typeof getFieldAreasDataCounts>>,
      Awaited<ReturnType<typeof getLicensedAreaDataCounts>>,
      Awaited<ReturnType<typeof getAllCompanies>>,
      Awaited<ReturnType<typeof getAllFields>>,
      Awaited<ReturnType<typeof getAllLicensedAreas>>,
    ]
  >
}

export default function AreasDataTable({ promises }: AreasDataTableProps) {
  const [
    { data, pageCount, error },
    companyCounts,
    fieldCounts,
    licensedAreaCounts,
    { data: allCompanies, error: errorCompanies },
    { data: allFields, error: errorFields },
    { data: allLicensedAreas, error: errorLicensedAreas },
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

  React.useEffect(() => {
    if (errorLicensedAreas !== null) toast.error(errorLicensedAreas, { id: "licensed-areas-data-error", duration: 5000, dismissible: true })
    return () => { 
      if (errorLicensedAreas !== null) toast.dismiss("licensed-areas-data-error")
    }
  }, [errorLicensedAreas])

  const [isPending, startTransition] = React.useTransition()

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<AreaDataExtend> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  let filterFields: DataTableFilterField<AreaDataExtend>[] = [
    {
      id: "id",
      label: "Название",
      placeholder: "Поиск...",
    }
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
  if (errorLicensedAreas === null) {
    filterFields = [
      ...filterFields,
      {
        id: "areaName",
        label: idToSentenceCase("areaName"),
        options: allLicensedAreas.map(({id, name}) => ({
          label: name,
          value: id,
          count: licensedAreaCounts[id],
        }))
      }
    ]
  }

  const facetedFilterFields = filterFields.slice(1);

  const advancedFilterFields = React.useMemo(
    () => getAdvancedFilterFields({ disabled: isPending }),
    [isPending]
  )

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    initialState: {
      sorting: [{ id: "companyName", desc: false }],
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
        <DataTableAdvancedToolbar
          table={table}
          filterFields={advancedFilterFields}
          shallow={false}
          disabled={isPending}
          isPending={isPending}
          draggableList
          prepend={
            <>
              <DataTableSearchInput
                key="id"
                table={table}
                columnId="id"
                placeholder="Поиск..."
              />
              <Separator className='w-0.5 h-8' />
            </>
          }
          append={
            <>
              {facetedFilterFields.length > 0 && <Separator className='w-0.5 h-8' />}
              {facetedFilterFields.map((column) => (
                <DataTableFacetedFilter
                  key={String(column.id)}
                  column={table.getColumn(column.id ? String(column.id) : "")}
                  title={column.label}
                  disabled={column.disabled}
                  options={column.options ?? []}
                />
              ))}
            </>
          }
        >
          <AreasDataTableToolbarActions table={table} disabled={isPending} />
        </DataTableAdvancedToolbar>
      </DataTable>
      <UpdateAreasDataSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        areaData={rowAction?.row.original ?? null}
      />
      <DeleteAreasDataDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        areasData={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      />
    </>
  )
}
