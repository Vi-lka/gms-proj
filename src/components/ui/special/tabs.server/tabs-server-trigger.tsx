"use client"

import React from 'react'
import { TabsTrigger } from '../../tabs'
import { useQueryStates } from 'nuqs'
import { searchParamsTabs } from '~/lib/validations/search-params'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TabsServerTrigger({
  value,
  title,
  pageUrl,
  defaultValue,
}: {
  value: string,
  title: string,
  pageUrl: string
  defaultValue?: string
}) {
  const [{ tab, view }] = useQueryStates(searchParamsTabs, { shallow: false })

  const [isPending, startTransition] = React.useTransition()

  const router = useRouter();

  const noTabInQuery = !tab

  function handleState(value: string) {
    if (noTabInQuery && (value === defaultValue)) return "active"
    if (value === tab) return "active"
    return "inactive"
  }

  return (
    <TabsTrigger 
      key={value} 
      value={value}
      defaultValue={defaultValue}
      data-state={handleState(value)}
      className='relative py-2 lg:px-6 md:text-sm text-xs rounded-lg hover:text-foreground'
      onMouseEnter={() => router.prefetch(`${pageUrl}?tab=${value}`)}
      onPointerEnter={() => router.prefetch(`${pageUrl}?tab=${value}`)}
      onTouchStart={() => router.prefetch(`${pageUrl}?tab=${value}`)}
      onFocus={() => router.prefetch(`${pageUrl}?tab=${value}`)}
      onClick={() => {
        if (!isPending && tab !== value) {
          startTransition(async () => {
            router.push(`${pageUrl}?tab=${value}&view=${view}`, { scroll: false })
            // await setTab({tab: value})
          })  
        }
      }}
    >
      {title}
      {isPending && <Loader size={14} className='absolute lg:right-1 -right-2 animate-spin' />}
    </TabsTrigger>
  )
}
