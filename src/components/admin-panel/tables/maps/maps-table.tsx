"use client"

import React from 'react'
import { toast } from 'sonner';
import { type DataTableRowAction } from '~/lib/types';
import { type MapDataExtend } from '~/server/db/schema';
import { type getMaps } from "~/server/queries/map-svg";
import { getColumns } from './maps-table-columns';
import { useDataTable } from '~/hooks/use-data-table';
import { DataTable } from '~/components/data-table/data-table';
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar';
import OpenImageDialog from './open-image-dialog';
import MapsTableToolbarActions from './maps-table-toolbar-actions';
import UpdateMapSheet from './update-map-sheet';

interface MapsTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getMaps>>,
    ]
  >
}

export default function MapsTable({ promises }: MapsTableProps) {
  const [{ data, pageCount, error }] = React.use(promises)

  React.useEffect(() => {
    if (error !== null) toast.error(error, { id: "data-error", duration: 5000, dismissible: true })
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])
  
  const [isPending, startTransition] = React.useTransition()

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<MapDataExtend> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter: false,
    initialState: {
      sorting: [{ id: "selected", desc: false }],
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
        <DataTableToolbar table={table} isPending={isPending}>
          <MapsTableToolbarActions table={table} />
        </DataTableToolbar>
      </DataTable>
      <UpdateMapSheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        map={rowAction?.row.original ?? null}
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
