"use client"

import React from 'react'
import { toast } from 'sonner';
import { type getRecent } from '~/server/queries/pages'
import { getColumns } from './recent-table-columns';
import { type RecentItem } from '~/lib/types';
import { useDataTable } from '~/hooks/use-data-table';
import { DataTable } from '~/components/data-table/data-table';
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar';
import { DataTableSortList } from '~/components/data-table/data-table-sort-list';
import { useRouter } from 'next/navigation';
import { errorToast } from '~/components/ui/special/error-toast';

export default function RecentTable({
  result,
  className
}: {
  result: Awaited<ReturnType<typeof getRecent>>,
  className?: string
}) {
  const { data, pageCount, error } = result;

  React.useEffect(() => {
    if (error !== null) errorToast(error, { id: "data-error" })
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  const [isPending, startTransition] = React.useTransition()

  const router = useRouter()

  const handleGoTo = React.useCallback((id: string, type: RecentItem["type"]) => {
    switch (type) {
      case "mapItem":
      case "cluster":
        return router.push(`/dashboard/map?activeId=${id}`);
      case "company":
        return router.push(`/dashboard/companies?name=${id}`);
      case "field":
        return router.push(`/dashboard/fields?name=${id}`);
      case "licensedArea":
        return router.push(`/dashboard/licensed-areas?name=${id}`);
      case "areaData":
        return router.push(`/dashboard/areas-data?search=${id}`);
      case "fieldMap":
        return router.push(`/dashboard/fmaps?name=${id}`);
      case "polygon":
        return router.push(`/dashboard/fmaps/${id}`);
      case "file":
        return router.push(`/dashboard/files?fileName=${id}`);
      case "profitability":
        return router.push(`/dashboard/profitability`);
      case "mapData":
        return router.push(`/dashboard/svg-maps`);
      case "user":
        return router.push(`/dashboard/users?name=${id}`);
    
      default:
        return;
    }
  }, [router])

  const columns = React.useMemo(
    () => getColumns({ handleGoTo }),
    [handleGoTo]
  )
  
  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter: false,
    initialState: {
      sorting: [{ id: "updatedAt", desc: true }],
      columnPinning: { 
        right: ["actions"]
      },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    startTransition,
    clearOnDefault: true,
  })

  return (
    <DataTable table={table} scrollAreaClassName={className} disabled={isPending}>
      <DataTableToolbar 
        table={table} 
        isPending={isPending} 
        prepend={
          <h2 className='font-semibold text-xs sm:text-sm md:text-base lg:text-lg'>Изменения за последние 30 дней</h2>
        }
      >
        <div className="flex items-center gap-2">
          <DataTableSortList table={table} disabled={isPending}/>
        </div>
      </DataTableToolbar>
    </DataTable>
  )
}
