"use client"

import React from 'react'
import { DataTable } from '~/components/data-table/data-table';
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar';
import { useDataTable } from '~/hooks/use-data-table';
import { type DataTableFilterField } from '~/lib/types';
import { type AreaDataExtend } from '~/server/db/schema';
import { type getAreasData } from '~/server/queries/area-data';
import { getColumns } from './licensed-area-data-table-colunms';
import { Loader } from 'lucide-react';
import { DataTableSortList } from '~/components/data-table/data-table-sort-list';

export default function LicensedAreaDataTable({
  areaData,
  className
}: {
  areaData: Awaited<ReturnType<typeof getAreasData>>,
  className?: string
}) {
  const { data, pageCount } = areaData;

  const [isPending, startTransition] = React.useTransition()
  
  const columns = React.useMemo(
    () => getColumns(),
    []
  )
  
  const filterFields: DataTableFilterField<AreaDataExtend>[] = [
    {
      id: "areaName",
      label: "Название",
      placeholder: "Поиск...",
      disabled: isPending
    }
  ]
  
  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    enableAdvancedFilter: false,
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    startTransition,
    clearOnDefault: true,
  })

  return (
    <DataTable table={table} scrollAreaClassName={className} disabled={isPending}>
      <DataTableToolbar table={table} filterFields={filterFields}>
        {isPending && <Loader className="mx-2 animate-spin" />}
        <DataTableSortList table={table} disabled={isPending}/>
      </DataTableToolbar>
    </DataTable>
  )
}
