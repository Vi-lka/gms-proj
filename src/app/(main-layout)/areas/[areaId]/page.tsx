import { Slash } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import { ContentLayout } from '~/components/main-content/content-layout'
import LicensedAreaDataTable from '~/components/main-content/tables/licensed-area-data-table'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb'
import { getValidFilters } from '~/lib/data-table-func'
import { type SearchParams } from '~/lib/types'
import { searchAreasDataCache } from '~/lib/validations/search-params'
import { getLicensedAreaPage } from '~/server/queries/pages'

export default async function AreaPage({
  params,
  searchParams
}: {
  params: Promise<{ areaId: string }>,
  searchParams: Promise<SearchParams>
}) {
  const licensedAreaId = (await params).areaId

  const searchParamsRes = await searchParams
  const search = searchAreasDataCache.parse(searchParamsRes)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {areaId, ...dataSearch} = search

  const validFilters = getValidFilters(dataSearch.filters)
  
  const result = await getLicensedAreaPage({
    ...dataSearch,
    areaId: licensedAreaId,
    filters: validFilters,
  })
  
  // handle errors by next.js error or not found pages
  if (result.error !== null) {
    if (result.error === "Not Found") notFound();
    else throw new Error(result.error);
  };
  
  const { mapItem, areaData, names } = result.data

  return (
    <ContentLayout container={false}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Главная</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/maps/${mapItem.id}`}>{mapItem.title}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className='flex gap-0.5 items-center'>
              {names.fieldName}
              <Slash size={16} className='text-muted-foreground/50 -rotate-45' />
              {names.areaName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-6 flex flex-col flex-grow p-8 rounded-xl dark:bg-background/50 shadow-inner border border-foreground/10">
        <LicensedAreaDataTable 
          areaData={areaData} 
          type="licensedArea"
          licensedAreaId={licensedAreaId}
          searchParams={search}
        />
      </div> 
    </ContentLayout>
  )
}
