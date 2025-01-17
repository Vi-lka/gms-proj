import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'
import { ContentLayout } from '~/components/admin-panel/content-layout';
import SessionsTable from '~/components/admin-panel/tables/users/sessions-table';
import { DataTableSkeleton } from '~/components/data-table/data-table-skeleton';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { getValidFilters } from '~/lib/data-table-func';
import type { PageProps } from '~/lib/types'
import { searchParamsSessionsCache } from '~/lib/validations/search-params';
import { auth } from '~/server/auth';
import { getSessionRolesCounts, getSessions } from '~/server/queries/users';

export default async function SessionsPage(props: PageProps) {
  const session = await auth();

  if (!session) redirect("/dashboard");

  const searchParams = await props.searchParams
  const search = searchParamsSessionsCache.parse(searchParams)

  const validFilters = getValidFilters(search.filters)

  const promises = Promise.all([
    getSessions({ ...search, filters: validFilters }),
    getSessionRolesCounts()
  ])

  return (
    <ContentLayout title="Сессии">
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
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Сессии</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-6">
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
          <SessionsTable promises={promises} />
        </React.Suspense>
      </div>
    </ContentLayout>
  )
}
