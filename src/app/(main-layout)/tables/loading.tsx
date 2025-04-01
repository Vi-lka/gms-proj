import Link from 'next/link'
import React from 'react'
import { DataTableSkeleton } from '~/components/data-table/data-table-skeleton'
import { ContentLayout } from '~/components/main-content/content-layout'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb'
import { Skeleton } from '~/components/ui/skeleton'

export default function LoadingMainTablePage() {
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
    </ContentLayout>
  )
}
