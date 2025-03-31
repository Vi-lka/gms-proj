import { MapIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { ContentLayout } from '~/components/main-content/content-layout'
import LicensedAreaDataTable from '~/components/main-content/tables/licensed-area-data-table'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { getValidFilters } from '~/lib/data-table-func'
import { type SearchParams } from '~/lib/types'
import { searchAreasDataCache } from '~/lib/validations/search-params'
import { getAreasData, getCompanyAreasDataCounts, getFieldAreasDataCounts, getLicensedAreaDataCounts } from '~/server/queries/area-data'
import { getAllCompanies } from '~/server/queries/companies'
import { getAllFields } from '~/server/queries/fields'
import { getAllLicensedAreas } from '~/server/queries/licensed-areas'

export default async function TablesPage({
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
    <ContentLayout container={false}>
      <div className='flex items-center flex-wrap justify-between gap-6'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Все данные</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className='flex flex-1 justify-end'>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <Link passHref href={`/`} className='flex w-fit h-fit'>
                <TooltipTrigger asChild>
                  <Button variant="outline" className='w-fit h-fit p-1 aspect-square shadow dark:border-foreground/20'>
                    <MapIcon />
                  </Button>
                </TooltipTrigger>
              </Link>
              <TooltipContent side='left'>
                <p className='font-medium'>
                  Карта
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="mt-6 flex flex-col flex-grow">
        <div className="flex flex-col flex-grow p-8 rounded-xl dark:bg-background/50 shadow-inner border border-foreground/10">
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
    </ContentLayout>
  )
}
