"use client"

import React from 'react'
import { DataTable } from '~/components/data-table/data-table';
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar';
import { useDataTable } from '~/hooks/use-data-table';
import { type DataTableFilterField } from '~/lib/types';
import { type AreaDataExtend } from '~/server/db/schema';
import { type getAreasData } from '~/server/queries/area-data';
import { getColumns } from './licensed-area-data-table-colunms';

export default function LicensedAreaDataTable({
  areaData
}: {
  areaData: Awaited<ReturnType<typeof getAreasData>>
}) {
  const { data, pageCount } = areaData;
  
  const columns = React.useMemo(
    () => getColumns(),
    []
  )
  
  const filterFields: DataTableFilterField<AreaDataExtend>[] = [
    {
      id: "areaName",
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
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} filterFields={filterFields}>
        {/* <AreasDataTableToolbarActions table={table} /> */}
      </DataTableToolbar>
    </DataTable>
  )
}
