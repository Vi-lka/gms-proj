import Link from 'next/link'
import React from 'react'
import { ContentLayout } from '~/components/admin-panel/content-layout'
import UsersTable from '~/components/admin-panel/tables/users/users-table'
import { DataTableSkeleton } from '~/components/skeletons/DataTableSkeleton'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb'
import { getValidFilters } from '~/lib/data-table-func'
import { type SearchParams } from '~/lib/types'
import { searchParamsUsersCache } from '~/lib/validations/search-params'
import { auth } from '~/server/auth'
import { getUserRolesCounts, getUsers } from '~/server/queries/users'

interface UsersPageProps {
  searchParams: Promise<SearchParams>
}

export default async function UsersPage(props: UsersPageProps) {
  const session = await auth();

  if (!session) return null;

  const searchParams = await props.searchParams
  const search = searchParamsUsersCache.parse(searchParams)

  const validFilters = getValidFilters(search.filters)

  const promises = Promise.all([
    getUsers(
      { ...search, filters: validFilters },
      session.user.role
    ),
    getUserRolesCounts(session.user.role)
  ])

  return (
    <ContentLayout title="Пользователи">
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
            <BreadcrumbPage>Пользователи</BreadcrumbPage>
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
          <UsersTable promises={promises} />
        </React.Suspense>
      </div>
    </ContentLayout>
  )
}
