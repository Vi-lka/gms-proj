import { MapIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { ContentLayout } from '~/components/main-content/content-layout'
import LicensedAreaDataTable from '~/components/main-content/tables/licensed-area-data-table'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'
import { getValidFilters } from '~/lib/data-table-func'
import { type SearchParams } from '~/lib/types'
import { searchAreasDataCache } from '~/lib/validations/search-params'
import { getAreasData } from '~/server/queries/area-data'
import { getMapItemPage } from '~/server/queries/pages'

export default async function MapItemTablePage({
  params,
  searchParams,
}: {
  params: Promise<{ mapItemId: string }>,
  searchParams: Promise<SearchParams>
}) {
  const mapItemId = (await params).mapItemId

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
  })
  
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
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className='flex flex-1 justify-end'>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <Link passHref href={`/maps/${mapItemId}`} className='flex w-fit h-fit'>
                <TooltipTrigger asChild>
                  <Button variant="outline" className='w-fit h-fit p-1 aspect-square shadow dark:border-foreground/20'>
                    <MapIcon />
                  </Button>
                </TooltipTrigger>
              </Link>
              <TooltipContent side='left'>
                <p className='font-medium'>
                  Карты
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="mt-6 flex flex-col flex-grow">
        <div className="flex flex-col flex-grow p-8 rounded-xl dark:bg-background/50 shadow-inner border border-foreground/10">
          <LicensedAreaDataTable areaData={areasData} />
        </div>
      </div>
    </ContentLayout>
  )
}
