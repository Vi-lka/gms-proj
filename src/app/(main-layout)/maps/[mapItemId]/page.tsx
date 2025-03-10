import Link from 'next/link'
import React from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb'
import { PolyStoreProvider } from '~/components/poly-annotation/store/poly-store-provider'
import { getMapItemPage } from '~/server/queries/pages'
import FieldMapContent from '~/components/main-content/field-map-content'
import { ContentLayout } from '~/components/main-content/content-layout'
import { notFound } from 'next/navigation'
import TabsServer from '~/components/ui/special/tabs.server'
import { type SearchParams } from '~/lib/types'
import { searchParamsTabsLoader } from '~/lib/validations/search-params'
import { DataTableSkeleton } from '~/components/data-table/data-table-skeleton'
import FieldTableContent from '~/components/main-content/field-table-content'

export default async function MapItemPage({
  params,
  searchParams
}: {
  params: Promise<{ mapItemId: string }>,
  searchParams: Promise<SearchParams>
}) {
  const mapItemId = (await params).mapItemId

  const { tab } = await searchParamsTabsLoader(searchParams)

  const result = await getMapItemPage(mapItemId)

  // handle errors by next.js error or not found pages
  if (result.error !== null) {
    if (result.error === "Not Found") notFound();
    else throw new Error(result.error);
  };

  const { title, fieldMaps } = result.data

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
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-6 flex flex-col flex-grow">
        <TabsServer
          defaultValue={fieldMaps[0]?.fieldId}
          searchParams={searchParams}
          pageUrl={`/maps/${mapItemId}`}
          tabs={fieldMaps.map(item => ({
            value: item.fieldId,
            title: item.fieldName,
            content: item.hasMap
              ? (
                  <PolyStoreProvider key={item.fieldId}>
                    <FieldMapContent data={item} />
                  </PolyStoreProvider>
              )
              : (
                <React.Suspense key={`${item.fieldId}-${tab}`} fallback={
                  <DataTableSkeleton
                    columnCount={6}
                    rowCount={5}
                    searchableColumnCount={1}
                    filterableColumnCount={2}
                    cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
                    shrinkZero
                  />
                }>
                  <FieldTableContent fieldId={item.fieldId} searchParams={searchParams} />
                </React.Suspense>
              )
          }))}
        />
      </div>
    </ContentLayout>
  )
}
