import Link from 'next/link'
import React from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb'
import { getMapItemPage } from '~/server/queries/pages'
import { ContentLayout } from '~/components/main-content/content-layout'
import { notFound } from 'next/navigation'
import TabsServer from '~/components/ui/special/tabs.server'
import { type SearchParams } from '~/lib/types'
import TabContent from './TabContent'

export default async function MapItemPage({
  params,
  searchParams
}: {
  params: Promise<{ mapItemId: string }>,
  searchParams: Promise<SearchParams>
}) {
  const mapItemId = (await params).mapItemId

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
            content: <TabContent data={item} searchParams={searchParams} />
          }))}
        />
      </div>
    </ContentLayout>
  )
}
