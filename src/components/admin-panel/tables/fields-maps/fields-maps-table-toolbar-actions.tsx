import { type Table } from '@tanstack/react-table'
import React from 'react'
import { type FieldMapExtend } from '~/server/db/schema'
import DeleteFieldsMapsDialog from './delete-fields-maps-dialog'
import { DataTableSortList } from '~/components/data-table/data-table-sort-list'
import { Button } from '~/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface FieldsMapsTableToolbarActionsProps {
  table: Table<FieldMapExtend>
}

export default function FieldsMapsTableToolbarActions({
  table
}: FieldsMapsTableToolbarActionsProps) {

  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteFieldsMapsDialog
          fieldsMaps={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <Link href={'/dashboard/fmaps/create'} passHref>
        <Button
          size="sm"
          className="gap-2 h-7"
        >
          Создать <Plus size={16} className='flex-none' />
        </Button>
      </Link>
      <DataTableSortList table={table}/>
    </div>
  )
}
