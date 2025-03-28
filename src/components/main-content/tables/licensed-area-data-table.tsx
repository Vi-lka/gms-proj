"use client"

import React from 'react'
import { DataTable } from '~/components/data-table/data-table';
import { useDataTable } from '~/hooks/use-data-table';
import { type DataTableFilterField } from '~/lib/types';
import { type AreaDataExtend } from '~/server/db/schema';
import { type getAreasData } from '~/server/queries/area-data';
import { getColumns } from './licensed-area-data-table-colunms';
import { toast } from 'sonner';
import { getAdvancedFilterFields } from './licensed-area-data-table-advanced-filter-fields';
import { DataTableAdvancedToolbar } from '~/components/data-table/data-table-advanced-toolbar';
import DataTableSearchInput from '~/components/data-table/data-table-search-input';
import { Separator } from '~/components/ui/separator';
import DownloadLicensedAreaDataTable from './download-licensed-area-data-table';
import { type GetAreasDataSchema } from '~/lib/validations/areas-data';
import { Download } from 'lucide-react';
import { useSession } from 'next-auth/react';

type ConditionalProps =
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
    };

type LicensedAreaDataTableProps = {
  areaData: Awaited<ReturnType<typeof getAreasData>>
  searchParams: GetAreasDataSchema
  className?: string
} & ConditionalProps

export default function LicensedAreaDataTable({
  areaData,
  searchParams,
  className,
  ...props
}: LicensedAreaDataTableProps) {
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
    initialState: {
      sorting: [{ id: "companyName", desc: false }],
    },
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
        isPending={isPending}
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
        childrenAppend={
          showDowloadButton && (
            <DownloadLicensedAreaDataTable 
              searchParams={searchParams} 
              disabled={isPending}
              className='p-2 h-fit'
              {...props}
            >
              <Download size={16} />
            </DownloadLicensedAreaDataTable>
          )
        }
      />
    </DataTable>
  )
}
