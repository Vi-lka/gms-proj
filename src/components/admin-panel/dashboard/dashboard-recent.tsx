import React from 'react'
import { getValidFilters } from '~/lib/data-table-func'
import { type SearchParams } from '~/lib/types'
import { searchParamsRecentCache } from '~/lib/validations/search-params'
import { getRecent } from '~/server/queries/pages'
import RecentTable from './recent-table'

export default async function DashboardRecent({
  searchParams 
}: {
  searchParams: Promise<SearchParams>
}) {
  const searchParamsRes = await searchParams

  const search = searchParamsRecentCache.parse(searchParamsRes)

  const validFilters = getValidFilters(search.filters)

  const currentDate = new Date().toLocaleDateString()
  
  const result = await getRecent(currentDate, {...search, filters: validFilters })

  return (
    <RecentTable result={result} className="max-h-[530px]" />
  )
}
