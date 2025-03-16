"use client"

import React from 'react'
import { type DataTableRowAction } from '~/lib/types';
import { type Profitability } from '~/server/db/schema';
import { type getProfitability } from '~/server/queries/profitability'
import { getColumns } from './profitability-table-columns';
import { useDataTable } from '~/hooks/use-data-table';
import { DataTable } from '~/components/data-table/data-table';
import { DataTableToolbar } from '~/components/data-table/data-table-toolbar';
import ProfitabilityTableToolbarActions from './profitability-table-toolbar-actions';
import UpdateProfitabilitySheet from './update-profitability-sheet';
import { toast } from 'sonner';

interface ProfitabilityTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getProfitability>>,
    ]
  >
}

export default function ProfitabilityTable({ promises }: ProfitabilityTableProps) {
  const [{ data, pageCount, error }] = React.use(promises)

  React.useEffect(() => {
    if (error !== null) toast.error(error, { id: "data-error", duration: 5000, dismissible: true })
    return () => { 
      if (error !== null) toast.dismiss("data-error")
    }
  }, [error])

  const [isPending, startTransition] = React.useTransition()

  const [rowAction, setRowAction] = React.useState<DataTableRowAction<Profitability> | null>(null);

  const columns = React.useMemo(
    () => getColumns({ setRowAction }),
    [setRowAction]
  )

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    // filterFields,
    enableAdvancedFilter: false,
    initialState: {
      columnPinning: {
        right: ["actions"],
        left: ["select"]
      },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    startTransition,
    shallow: false,
    clearOnDefault: true,
  })

  return (
    <>
      <DataTable table={table} disabled={isPending}>
        <DataTableToolbar table={table} isPending={isPending}>
          <ProfitabilityTableToolbarActions table={table} />
        </DataTableToolbar>
      </DataTable>
      <UpdateProfitabilitySheet
        open={rowAction?.type === "update"}
        onOpenChange={() => setRowAction(null)}
        profitability={rowAction?.row.original ?? null}
      />
      {/* <DeleteProfitabilityDialog
        open={rowAction?.type === "delete"}
        onOpenChange={() => setRowAction(null)}
        companies={rowAction?.row.original ? [rowAction?.row.original] : []}
        showTrigger={false}
        onSuccess={() => rowAction?.row.toggleSelected(false)}
      /> */}
    </>
  )
}
