"use client"

import React from 'react'
import { DataTable } from '~/components/data-table/data-table';
import { useDataTable } from '~/hooks/use-data-table';
import { type DataTableFilterField } from '~/lib/types';
import { type AreaDataExtend } from '~/server/db/schema';
import { type getAreasData } from '~/server/queries/area-data';
import { getColumns } from './licensed-area-data-table-colunms';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';
import { getAdvancedFilterFields } from './licensed-area-data-table-advanced-filter-fields';
import { DataTableAdvancedToolbar } from '~/components/data-table/data-table-advanced-toolbar';
import DataTableSearchInput from '~/components/data-table/data-table-search-input';
import { Separator } from '~/components/ui/separator';

export default function LicensedAreaDataTable({
  areaData,
  className
}: {
  areaData: Awaited<ReturnType<typeof getAreasData>>,
  className?: string
}) {
  const { data, pageCount, error } = areaData;

  React.useEffect(() => {
    if (error !== null) toast.error(error, { id: "areas-data-error", duration: 5000, dismissible: true })
    return () => { 
      if (error !== null) toast.dismiss("areas-data-error")
    }
  }, [error])

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

  const advancedFilterFields = React.useMemo(
    () => getAdvancedFilterFields({ disabled: isPending }),
    [isPending]
  )
  
  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    startTransition,
    clearOnDefault: true,
  })

  return (
    <DataTable table={table} scrollAreaClassName={className} disabled={isPending}>
      <DataTableAdvancedToolbar
        table={table}
        filterFields={advancedFilterFields}
        shallow={false}
        disabled={isPending}
        draggableList
        prepend={
          <>
            <DataTableSearchInput
              key="areaName"
              table={table}
              columnId="areaName"
              placeholder="Поиск..."
            />
            <Separator className='w-0.5 h-8' />
          </>
        }
      >
        {isPending && (
          <div className='flex items-center gap-1 mx-2'>
            <Loader size={18} className="flex-none animate-spin" />
            <span className='text-sm font-light md:block hidden'>Загрузка...</span>
          </div>
        )}
      </DataTableAdvancedToolbar>
    </DataTable>
  )
}
