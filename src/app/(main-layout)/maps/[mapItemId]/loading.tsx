import Link from 'next/link'
import React from 'react'
import DefaultLoading from '~/components/loadings/default'
import { ContentLayout } from '~/components/main-content/content-layout'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb'
import { Skeleton } from '~/components/ui/skeleton'

export default function LoadingMapItemPage() {
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
            <BreadcrumbPage className='flex gap-0.5 items-center'>
              <Skeleton className='w-24 h-5' />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-6 flex flex-col gap-6 flex-grow">
        <Skeleton className='w-full h-11' />
        <DefaultLoading />
      </div>
    </ContentLayout>
  )
}
