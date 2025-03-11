import React from 'react'
import { DataTableSkeleton } from '~/components/data-table/data-table-skeleton'
import FieldMapContent from '~/components/main-content/field-map-content'
import FieldTableContent from '~/components/main-content/field-table-content'
import { PolyStoreProvider } from '~/components/poly-annotation/store/poly-store-provider'
import { type SearchParams } from '~/lib/types'
import { type getMapItemPage } from '~/server/queries/pages'
import ChildrensSwitch from '~/components/ui/special/childrens-switch'

type ReturnDataT = Awaited<ReturnType<typeof getMapItemPage>>

export default function TabContent({
  data,
  searchParams
}: {
  data: NonNullable<ReturnDataT["data"]>["fieldMaps"][number],
  searchParams: Promise<SearchParams>
}) {

  if (data.hasMap) return (
    <ChildrensSwitch 
      className='relative mt-4 sm:pl-0 pl-4'
      classNameSwitch='absolute w-fit rotate-90 sm:left-[-62px] left-[-46px] top-10 [&>svg]:-rotate-90'
      firstIcon="map" 
      secondIcon="table"
      childrenFirst={
        <PolyStoreProvider key={data.fieldId}>
          <FieldMapContent data={data} />
        </PolyStoreProvider>
      }
      childrenSecond={
        <div className="flex flex-col flex-grow p-8 rounded-xl dark:bg-background/50 shadow-inner border border-foreground/10">
          <React.Suspense key={data.fieldId} fallback={<DataTableSkeleton
            columnCount={6}
            rowCount={5}
            searchableColumnCount={1}
            filterableColumnCount={2}
            cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
            shrinkZero />}>
            <FieldTableContent fieldId={data.fieldId} searchParams={searchParams} />
          </React.Suspense>
        </div>
      }
    />
  ) 
  return (
    <div className="mt-4 flex flex-col flex-grow p-8 rounded-xl dark:bg-background/50 shadow-inner border border-foreground/10">
      <React.Suspense key={data.fieldId} fallback={
        <DataTableSkeleton
          columnCount={6}
          rowCount={5}
          searchableColumnCount={1}
          filterableColumnCount={2}
          cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
          shrinkZero
        />
      }>
        <FieldTableContent fieldId={data.fieldId} searchParams={searchParams} />
      </React.Suspense>
    </div>
  )
}
