import React from 'react'
import { getValidFilters } from '~/lib/data-table-func'
import { type SearchParams } from '~/lib/types'
import { searchAreasDataCache } from '~/lib/validations/search-params'
import { getAreasData } from '~/server/queries/area-data'

export default async function FieldTableContent({
  fieldId,
  searchParams
}: {
  fieldId: string,
  searchParams: Promise<SearchParams>
}) {
  const searchParamsRes = await searchParams
  const search = searchAreasDataCache.parse(searchParamsRes)
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {fieldId: unused, ...dataSearch} = search
  
  const validFilters = getValidFilters(dataSearch.filters)

  // const { data, pageCount, error } = await getAreasData({
  //   ...dataSearch,
  //   fieldId,
  //   filters: validFilters,
  // })
    
  const promises = Promise.all([
    getAreasData({
      ...dataSearch,
      fieldId,
      filters: validFilters,
    }),
  ])

  return (
    <div>field-table-content</div>
  )
}
