import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'
import { ContentLayout } from '~/components/admin-panel/content-layout';
import LicensedAreasTable from '~/components/admin-panel/tables/licensed-areas/licensed-areas-table';
import { DataTableSkeleton } from '~/components/data-table/data-table-skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { getValidFilters } from '~/lib/data-table-func';
import { type PageProps } from '~/lib/types'
import { searchLicensedAreasCache } from '~/lib/validations/search-params';
import { auth } from '~/server/auth';
import { getLicensedAreas } from '~/server/queries/licensed-areas';

export default async function LicensedAreasPage(props: PageProps) {
  const session = await auth();

  if (!session) redirect("/dashboard");

  const searchParams = await props.searchParams
  const search = searchLicensedAreasCache.parse(searchParams)

  const validFilters = getValidFilters(search.filters)

  const promises = Promise.all([
    getLicensedAreas({ ...search, filters: validFilters }),
  ])

  return (
    <ContentLayout title="Лицензионные участки">
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
            <BreadcrumbPage>Лицензионные участки</BreadcrumbPage>
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
          <LicensedAreasTable promises={promises} />
        </React.Suspense>
      </div>
    </ContentLayout>
  )
}
