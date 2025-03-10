import Link from 'next/link'
import React from 'react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb'
import { Skeleton } from '~/components/ui/skeleton'
import { PolyStoreProvider } from '~/components/poly-annotation/store/poly-store-provider'
import { getMapItemPage } from '~/server/queries/pages'
import FieldMapContent from '~/components/main-content/field-map-content'
import TabsCustom from '~/components/ui/special/tabs-custom'
import { ContentLayout } from '~/components/main-content/content-layout'

export default async function MapItemPage({
  params,
}: {
  params: Promise<{ mapItemId: string }>
}) {
  const mapItemId = (await params).mapItemId

  const result = await getMapItemPage(mapItemId)

  // handle errors by next.js error or not found pages
  if (result.error !== null) throw new Error(result.error);

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
        <React.Suspense fallback={<Skeleton className='w-full min-h-[calc(100vh-290px)]' />}>
          <TabsCustom
            tabs={fieldMaps.map(item => ({
              value: item.fieldId,
              title: item.fieldName,
              content: item.hasMap
                ? (
                  <PolyStoreProvider key={item.fieldId}>
                    <FieldMapContent data={item} />
                  </PolyStoreProvider>
                )
                : <p>{item.fieldName}</p>
            }))}
          />
        </React.Suspense>
      </div>
    </ContentLayout>
  )
}
