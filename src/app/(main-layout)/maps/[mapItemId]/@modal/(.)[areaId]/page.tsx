import { Slash } from "lucide-react"
import { notFound } from "next/navigation"
import React from "react"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import LicensedAreaDataTable from "~/components/main-content/tables/licensed-area-data-table"
import InterseptingModal from "~/components/navigation/intersepting-modal"
import { type SearchParams } from "~/lib/types"
import { searchAreasDataCache } from "~/lib/validations/search-params"
import { getAreaPage } from "~/server/queries/pages"

export default async function AreaModalPage({
  params,
  searchParams
}: {
  params: Promise<{ mapItemId: string, areaId: string }>,
  searchParams: Promise<SearchParams>
}) {
  const licensedAreaId = (await params).areaId
  const mapItemId = (await params).mapItemId

  console.log(mapItemId, licensedAreaId)

  const searchParamsRes = await searchParams
  const search = searchAreasDataCache.parse(searchParamsRes)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {areaId, ...dataSearch} = search
  
  const result = await getAreaPage(mapItemId, {
    ...dataSearch,
    areaId: licensedAreaId
  })
  
  // handle errors by next.js error or not found pages
  if (result.error !== null) throw new Error(result.error);
  
  const { areaData } = result.data

  if (!areaData.data[0]?.areaName) notFound();

  return (
    <InterseptingModal 
      title={
        <div className='flex gap-0.5 items-center'>
          {areaData.data[0].fieldName}
          <Slash size={16} className='text-muted-foreground/50 -rotate-45' />
          {areaData.data[0].areaName}
        </div>
      }
      className=" min-h-[calc(100vh-60px)]"
    >
      <div className="mt-6 flex flex-col flex-grow p-8 rounded-2xl dark:bg-background/50 shadow-inner border border-foreground/20">
        <React.Suspense fallback={
          <DataTableSkeleton
            columnCount={6}
            rowCount={5}
            searchableColumnCount={1}
            filterableColumnCount={2}
            cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
            shrinkZero
          />
        }>
          <LicensedAreaDataTable areaData={areaData} />
        </React.Suspense>
      </div>
    </InterseptingModal>
  )
}