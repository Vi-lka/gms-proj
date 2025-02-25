import Link from 'next/link'
import React from 'react'
import { ContentLayout } from '~/components/main-content/content-layout'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb'
import { getMapItem } from '~/server/queries/map'
import Tables from './Tables'

export default async function MapItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id

  const data = await getMapItem(id)

  if (!data?.companiesToMapItems[0]) return (
    <ContentLayout>
      <div>Объект не найден</div>
    </ContentLayout>
  ) // TODO: handle not found

  const title = data.cluster?.name ?? data.companiesToMapItems[0].company.name

  return (
    <ContentLayout container={false} classNameContainer="">
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

      <Tables 
        svg={"/images/test.svg"} 
        title={title}
        data={data}
      />
    </ContentLayout>
  )
}
