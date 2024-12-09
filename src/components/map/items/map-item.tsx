import React from 'react'
import type { MapGroupT } from '~/lib/types'
import GroupItem from './group-item'
import SingleItem from './single-item'

export default function MapItem({
  data
}: {
  data: MapGroupT,
})  {
  if (data.intersection) return <GroupItem data={data} />
  return <SingleItem data={data.items} />
}
