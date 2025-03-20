import React, { Suspense } from 'react'
import DashboardCounts from './dashboard-counts'
import { Skeleton } from '~/components/ui/skeleton'
import { type SearchParams } from '~/lib/types'
import DashboardRecent from './dashboard-recent'
import { DataTableSkeleton } from '~/components/data-table/data-table-skeleton'

export default function DashboardContent({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  return (
    <div className="flex flex-col gap-12">
      <Suspense fallback={
        <div className="sm:grid-cols-2 lg:grid-cols-4 grid grid-cols-1 gap-4 px-4 lg:px-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-[148px] rounded-xl"/>
          ))}
        </div>
      }>
        <DashboardCounts />
      </Suspense>
      <Suspense fallback={
        <DataTableSkeleton
          columnCount={6}
          rowCount={5}
          searchableColumnCount={1}
          filterableColumnCount={2}
          cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
          shrinkZero
        />
      }>
        <DashboardRecent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
