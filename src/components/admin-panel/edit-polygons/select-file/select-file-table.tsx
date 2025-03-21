"use client"

import React from 'react'
import { type DataTableFilterField, type DataTableRowAction } from '~/lib/types'
import { type FileDBWithUrl } from '~/server/db/schema'
import { type getFiles } from '~/server/queries/files'
import { getColumns } from './select-file-table-columns'
import { type Row } from '@tanstack/react-table'
import { useDataTable } from '~/hooks/use-data-table'
import { toast } from 'sonner'
import { DataTable } from '~/components/data-table/data-table'
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar'
import { DataTableSortList } from '~/components/data-table/data-table-sort-list'
import OpenImageDialog from '../../tables/files/open-image-dialog'
import { useQueryStates } from 'nuqs'
import { searchParamsFiles } from '~/lib/validations/search-params'
import useSWR from 'swr'
import { getApiRoute } from '~/lib/validations/api-routes'
import { usePolyStore } from '~/components/poly-annotation/store/poly-store-provider'

export default function SelectFileTable({
  afterSelect,
  className
}: {
  afterSelect?: () => void,
  className?: string
}) {
  const setSelectedImage = usePolyStore((state) => state.setSelectedImage)
  const setImageUrl = usePolyStore((state) => state.setImageUrl)
  const setImageFile = usePolyStore((state) => state.setImageFile)

  const [searchParams] = useQueryStates(searchParamsFiles)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hasConnected, ...otherParams } = searchParams

  const { data: result, error, isLoading } = useSWR<Awaited<ReturnType<typeof getFiles>>, Error>(
    getApiRoute({
      route: "files", 
      searchParams: {
        hasConnected: "false",
        ...otherParams
      }
    })
  );

  React.useEffect(() => {
    if (error && error.message.length > 0) toast.error(error.message, { id: "data-error", duration: 5000, dismissible: true })
    return () => { 
      if (error && error.message.length > 0) toast.dismiss("data-error")
    }
  }, [error])
  React.useEffect(() => {
    if (result && result.error !== null) toast.error(result.error, { id: "data-error", duration: 5000, dismissible: true })
    return () => { 
      if (result && result.error !== null) toast.dismiss("data-error")
    }
  }, [result])

  const [isPending, startTransition] = React.useTransition()

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<FileDBWithUrl> | null>(null);

  const onSelect = React.useCallback((row: Row<FileDBWithUrl>) => {
    setSelectedImage({
      id: row.original.id,
      originalName: row.original.originalName,
      url: row.original.fileUrl
    })
    setImageUrl(row.original.fileUrl)
    setImageFile(null)
    afterSelect?.()
  }, [afterSelect, setImageFile, setImageUrl, setSelectedImage])

  const columns = React.useMemo(
    () => getColumns({ setRowAction, onSelect }),
    [onSelect]
  )

  const filterFields: DataTableFilterField<FileDBWithUrl>[] = [
    {
      id: "fileName",
      label: "Название",
      placeholder: "Поиск...",
    }
  ]

  const { table } = useDataTable({
    data: result?.data ?? [],
    columns,
    pageCount: result?.pageCount ?? 0,
    filterFields,
    enableAdvancedFilter: false,
    initialState: {
      sorting: [{ id: "originalName", desc: false }],
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
    <>
      <DataTable 
        table={table}
        disabled={isPending || isLoading} 
        isLoading={isLoading}
        scrollAreaClassName={className}
      >
        <DataTableToolbar table={table} filterFields={filterFields} isPending={isPending || isLoading}>
          <div className="flex items-center gap-2">
            <DataTableSortList table={table} disabled={isPending || isLoading}/>
          </div>
        </DataTableToolbar>
      </DataTable>
      <OpenImageDialog
        open={rowAction?.type === "dialog"}
        onOpenChange={() => setRowAction(null)}
        row={rowAction?.row}
        showTrigger={false}
      />
    </>
  )
}
