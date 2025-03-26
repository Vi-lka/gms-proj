import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'
import { ContentLayout } from '~/components/admin-panel/content-layout';
import AreasDataTable from '~/components/admin-panel/tables/areas-data/areas-data-table';
import { DataTableSkeleton } from '~/components/data-table/data-table-skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { getValidFilters } from '~/lib/data-table-func';
import { type PageProps } from '~/lib/types';
import { searchAreasDataCache } from '~/lib/validations/search-params';
import { auth } from '~/server/auth';
import { getAreasData, getCompanyAreasDataCounts, getFieldAreasDataCounts, getLicensedAreaDataCounts } from '~/server/queries/area-data';
import { getAllCompanies } from '~/server/queries/companies';
import { getAllFields } from '~/server/queries/fields';
import { getAllLicensedAreas } from '~/server/queries/licensed-areas';

export default async function AreasDataPage(props: PageProps) {
  const session = await auth();

  if (!session) redirect("/dashboard");

  const searchParams = await props.searchParams
  const search = searchAreasDataCache.parse(searchParams)

  const validFilters = getValidFilters(search.filters)

  const promises = Promise.all([
    getAreasData({ ...search, filters: validFilters }, "id"),
    getCompanyAreasDataCounts(),
    getFieldAreasDataCounts(),
    getLicensedAreaDataCounts(),
    getAllCompanies(),
    getAllFields(),
    getAllLicensedAreas()
  ])

  return (
    <ContentLayout title="Данные ЛУ">
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
            <BreadcrumbPage>Данные ЛУ</BreadcrumbPage>
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
          <AreasDataTable promises={promises} />
        </React.Suspense>
      </div>
    </ContentLayout>
  )
}
