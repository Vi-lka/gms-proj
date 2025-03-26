import { notFound } from "next/navigation"
import { Suspense } from "react"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import LicensedAreaDataTable from "~/components/main-content/tables/licensed-area-data-table"
import InterseptingModal from "~/components/navigation/intersepting-modal"
import { Skeleton } from "~/components/ui/skeleton"
import { getValidFilters } from "~/lib/data-table-func"
import { type SearchParams } from "~/lib/types"
import { searchAreasDataCache } from "~/lib/validations/search-params"
import { auth } from "~/server/auth"
import { getAreasData } from "~/server/queries/area-data"
import { getMapItemPage } from "~/server/queries/pages"

export default async function MapItemTableModalPage({
  params,
  searchParams
}: {
  params: Promise<{ mapItemId: string }>,
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()

  const mapItemId = (await params).mapItemId
  return (
    <InterseptingModal 
      modal={false} 
      title={"Данные"} 
      className="h-[calc(100vh-60px)]"
      userSelect={session?.user.role === "guest" ? "none" : "auto"}
    >
      <Suspense key={mapItemId} fallback={
        <>
          <div className='flex gap-0.5 justify-center items-center text-center line-clamp-1'>
            <Skeleton className='w-1/2 h-5' />
          </div>
          <div className="mt-6 flex flex-col flex-grow p-8 rounded-xl dark:bg-background/50 shadow-inner border border-foreground/10">
            <DataTableSkeleton
              columnCount={6}
              rowCount={5}
              searchableColumnCount={1}
              filterableColumnCount={2}
              cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
              shrinkZero
            />
          </div>
        </>
      }>
        <Content mapItemId={mapItemId} searchParams={searchParams} />
      </Suspense>
    </InterseptingModal>
  )
}

async function Content({
  mapItemId,
  searchParams,
}: {
  mapItemId: string
  searchParams: Promise<SearchParams>
}) {
  const result = await getMapItemPage(mapItemId, false)
  
  // handle errors by next.js error or not found pages
  if (result.error !== null) {
    if (result.error === "Not Found") notFound();
    else throw new Error(result.error);
  };

  const { title, fieldMaps } = result.data

  const searchParamsRes = await searchParams
  const search = searchAreasDataCache.parse(searchParamsRes)
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {fieldsIds: unused, ...dataSearch} = search
  
  const validFilters = getValidFilters(dataSearch.filters)

  const areasData = await getAreasData({
    ...dataSearch,
    fieldsIds: fieldMaps.map((fieldMap) => fieldMap.fieldId),
    filters: validFilters,
  }, "areaName")

  return (
    <>
      <div className='flex gap-0.5 justify-center items-center text-center line-clamp-1'>
        <p className="w-1/2 line-clamp-1">{title}</p>
      </div>
      <div className="mt-6 bg-secondary rounded-2xl">
        <div className="flex flex-col flex-grow sm:p-8 p-4 rounded-2xl dark:bg-background/50 shadow-inner border border-foreground/10">
          <LicensedAreaDataTable areaData={areasData} className="sm:max-h-[calc(100vh-420px)] max-h-[calc(100vh-490px)]" />
        </div>
      </div>
    </>
  )
}