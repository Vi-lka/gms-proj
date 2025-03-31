"use client"

import React from 'react'
import { DataTable } from '~/components/data-table/data-table';
import { useDataTable } from '~/hooks/use-data-table';
import { type DataTableFilterField } from '~/lib/types';
import { type AreaDataExtend } from '~/server/db/schema';
import type { getCompanyAreasDataCounts, getFieldAreasDataCounts, getLicensedAreaDataCounts, getAreasData } from '~/server/queries/area-data';
import { getColumns } from './licensed-area-data-table-colunms';
import { toast } from 'sonner';
import { getAdvancedFilterFields } from './licensed-area-data-table-advanced-filter-fields';
import { DataTableAdvancedToolbar } from '~/components/data-table/data-table-advanced-toolbar';
import { Separator } from '~/components/ui/separator';
import DownloadLicensedAreaDataTable from './download-licensed-area-data-table';
import { type GetAreasDataSchema } from '~/lib/validations/areas-data';
import { Download } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { type getAllCompanies } from '~/server/queries/companies';
import { type getAllFields } from '~/server/queries/fields';
import { type getAllLicensedAreas } from '~/server/queries/licensed-areas';
import { idToSentenceCase } from '~/lib/utils';
import { DataTableFacetedFilter } from '~/components/data-table/data-table-faceted-filter';
import SearchInput from '~/components/ui/special/search-input';

type ConditionalProps = 
  | {
      enableFilters?: false,
    }
  | {
      enableFilters?: true,
      companyCounts: Awaited<ReturnType<typeof getCompanyAreasDataCounts>>,
      fieldCounts: Awaited<ReturnType<typeof getFieldAreasDataCounts>>,
      licensedAreaCounts: Awaited<ReturnType<typeof getLicensedAreaDataCounts>>,
      companies: Awaited<ReturnType<typeof getAllCompanies>>,
      fields: Awaited<ReturnType<typeof getAllFields>>,
      licensedAreas: Awaited<ReturnType<typeof getAllLicensedAreas>>,
    }


type ConditionalFiltersProps =
  | {
      type: "licensedArea",
      licensedAreaId: string,
    }
  | {
      type: "field",
      fieldId: string,
    }
  | {
      type: "fields",
      fieldsIds: string[],
    }
  | {
      type: "all",
    };

type LicensedAreaDataTableProps = {
  areaData: Awaited<ReturnType<typeof getAreasData>>
  searchParams: GetAreasDataSchema
  className?: string
} & ConditionalFiltersProps & ConditionalProps

export default function LicensedAreaDataTable({
  areaData,
  searchParams,
  className,
  ...props
}: LicensedAreaDataTableProps) {
  const {
    enableFilters,
    ...filtersProps
  } = props

  let errorCompanies: string | null = null
  let errorFields: string | null = null
  let errorLicensedAreas: string | null = null

  if (enableFilters === true) {
    if (props.companies.error !== null) errorCompanies = props.companies.error
    if (props.fields.error !== null) errorFields = props.fields.error
    if (props.licensedAreas.error !== null) errorLicensedAreas = props.licensedAreas.error  
  }

  const session = useSession();

  const userRole = session.data?.user.role
  const showDowloadButton = !(!userRole || userRole === "guest" || userRole === "unknown")

  const { data, pageCount, error } = areaData;

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
  
  const columns = React.useMemo(
    () => getColumns(),
    []
  )

  let filterFields: DataTableFilterField<AreaDataExtend>[] = []
  if (enableFilters === true) {
    if (props.companies.error === null) {
      filterFields = [
        ...filterFields,
        {
          id: "companyName",
          label: idToSentenceCase("companyName"),
          options: props.companies.data.map(({id, name}) => ({
            label: name,
            value: id,
            count: props.companyCounts[id],
          }))
        }
      ]
    }
    if (props.fields.error === null) {
      filterFields = [
        ...filterFields,
        {
          id: "fieldName",
          label: idToSentenceCase("fieldName"),
          options: props.fields.data.map(({id, name}) => ({
            label: name,
            value: id,
            count: props.fieldCounts[id],
          }))
        }
      ]
    }
    if (props.licensedAreas.error === null) {
      filterFields = [
        ...filterFields,
        {
          id: "areaName",
          label: idToSentenceCase("areaName"),
          options: props.licensedAreas.data.map(({id, name}) => ({
            label: name,
            value: id,
            count: props.licensedAreaCounts[id],
          }))
        }
      ]
    }
  }

  const facetedFilterFields = filterFields

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
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    startTransition,
    clearOnDefault: true,
  })

  return (
    <DataTable table={table} disabled={isPending} scrollAreaClassName={className}>
      <DataTableAdvancedToolbar
        table={table}
        filterFields={advancedFilterFields}
        shallow={false}
        disabled={isPending}
        isPending={isPending}
        draggableList
        prepend={
          <>
            <SearchInput
              key="search"
              placeholder="Поиск..."
              isPending={isPending}
              startTransition={startTransition}
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
        childrenAppend={
          showDowloadButton && (
            <DownloadLicensedAreaDataTable 
              searchParams={searchParams} 
              disabled={isPending}
              className='p-2 h-fit'
              {...filtersProps}
            >
              <Download size={16} />
            </DownloadLicensedAreaDataTable>
          )
        }
      />
    </DataTable>
  )
}
