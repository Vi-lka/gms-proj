import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'
import { ContentLayout } from '~/components/admin-panel/content-layout';
import FieldsMapsTable from '~/components/admin-panel/tables/fields-maps/fields-maps-table';
import { DataTableSkeleton } from '~/components/data-table/data-table-skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { getValidFilters } from '~/lib/data-table-func';
import { type PageProps } from '~/lib/types';
import { searchFieldsMapsCache } from '~/lib/validations/search-params';
import { auth } from '~/server/auth';
import { getFieldsMaps } from '~/server/queries/fields-maps';

export default async function FieldsMapsPage(props: PageProps) {
  const session = await auth();

  if (!session) redirect("/dashboard");

  const searchParams = await props.searchParams
  const search = searchFieldsMapsCache.parse(searchParams)
  
  const validFilters = getValidFilters(search.filters)

  const promises = Promise.all([
    getFieldsMaps({ ...search, filters: validFilters })
  ])

  return (
    <ContentLayout title="Карты Месторождений">
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
              <Link href="/dashboard">Панель</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Карты Месторождений</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-6 flex flex-col flex-grow">
        <React.Suspense
          fallback={
            <DataTableSkeleton
              columnCount={6}
              searchableColumnCount={1}
              filterableColumnCount={2}
              cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem", "8rem"]}
              shrinkZero
            />
          }
        >
          <FieldsMapsTable promises={promises} />
        </React.Suspense>
      </div>
    </ContentLayout>
  )
}
