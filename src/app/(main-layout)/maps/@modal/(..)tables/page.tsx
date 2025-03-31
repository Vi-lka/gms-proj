import { Suspense } from "react"
import { DataTableSkeleton } from "~/components/data-table/data-table-skeleton"
import LicensedAreaDataTable from "~/components/main-content/tables/licensed-area-data-table"
import InterseptingModal from "~/components/navigation/intersepting-modal"
import { Skeleton } from "~/components/ui/skeleton"
import { getValidFilters } from "~/lib/data-table-func"
import { type SearchParams } from "~/lib/types"
import { searchAreasDataCache } from "~/lib/validations/search-params"
import { auth } from "~/server/auth"
import { getAreasData, getCompanyAreasDataCounts, getFieldAreasDataCounts, getLicensedAreaDataCounts } from "~/server/queries/area-data"
import { getAllCompanies } from "~/server/queries/companies"
import { getAllFields } from "~/server/queries/fields"
import { getAllLicensedAreas } from "~/server/queries/licensed-areas"

export default async function MapItemTableModalPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()

  return (
    <InterseptingModal 
      modal={false} 
      title={"Данные"} 
      className="h-[calc(100vh-60px)]"
      userSelect={session?.user.role === "guest" ? "none" : "auto"}
    >
      <Suspense fallback={
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
        <Content searchParams={searchParams} />
      </Suspense>
    </InterseptingModal>
  )
}

async function Content({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const searchParamsRes = await searchParams
  const search = searchAreasDataCache.parse(searchParamsRes)
  
  const validFilters = getValidFilters(search.filters)

  const areasData = await getAreasData({
    ...search,
    filters: validFilters,
  })
  const companyCounts = await getCompanyAreasDataCounts()
  const fieldCounts = await getFieldAreasDataCounts()
  const licensedAreaCounts = await getLicensedAreaDataCounts()
  const companies = await getAllCompanies()
  const fields = await getAllFields()
  const licensedAreas = await getAllLicensedAreas()

  return (
    <>
      <div className='flex gap-0.5 justify-center items-center text-center line-clamp-1'>
        <p className="w-1/2 line-clamp-1">Все данные</p>
      </div>
      <div className="mt-6 bg-secondary rounded-2xl">
        <div className="flex flex-col flex-grow sm:p-8 p-4 rounded-2xl dark:bg-background/50 shadow-inner border border-foreground/10">
          <LicensedAreaDataTable 
            type="all"
            enableFilters
            areaData={areasData} 
            companyCounts={companyCounts}
            fieldCounts={fieldCounts}
            licensedAreaCounts={licensedAreaCounts}
            companies={companies}
            fields={fields}
            licensedAreas={licensedAreas}
            searchParams={search}
          />
        </div>
      </div>
    </>
  )
}