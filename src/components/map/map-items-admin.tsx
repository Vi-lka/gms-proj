import React from 'react'
import { Layer } from 'react-konva'
import getIntersections from '~/lib/intersections/get-intersections';
import valueFromWindowWidth from '~/lib/intersections/valueFromWindowWidth';
import { useAtom, useAtomValue } from 'jotai';
import { mapContainerDimensions, selectedItemAtom, stageAtom } from '~/lib/atoms/main';
import GroupItem from './items/group-item';
import SingleItem from './items/single-item';
import { cn } from '~/lib/utils';
import { useQueryState } from 'nuqs';
import { type getProfitability } from '~/server/queries/profitability';
import { type getMapItems } from '~/server/queries/map';
import { useMapItems } from './filters/hooks';

export default function MapItemsAdmin({
  data,
  profitability,
}: {
  data: Awaited<ReturnType<typeof getMapItems>>['data'], 
  profitability: Awaited<ReturnType<typeof getProfitability>>['data']
}) {
  const items = useMapItems(data, profitability, false)

  const [activeId, setActiveId] = useQueryState("activeId", { defaultValue: "" });
  const stage = useAtomValue(stageAtom);
  const { width: windowW } = useAtomValue(mapContainerDimensions);

  const [selectedItem, setSelectedItem] = useAtom(selectedItemAtom)

  const scaleForIntersections = valueFromWindowWidth({
    windowW,
    w1024: 1.3*stage.scale,
    w425: 1.1*stage.scale,
    minw: 0.9*stage.scale,
  })

  const intersections = React.useMemo(
    () => getIntersections(items, scaleForIntersections),
    [items, scaleForIntersections]
  );

  const filteredByActiveId = React.useMemo(
    () => intersections.filter(item => {
      if (!activeId) return true;
      if (item.intersection) return item.items.find(el => el.id === activeId)
      else return item.data.id === activeId
    }),
    [activeId, intersections]
  )

  return (
    <Layer>
      {filteredByActiveId.map((item, indx) => (
        item.intersection
          ? (
            <GroupItem 
              key={indx}
              data={item}
              className={item.items.find(el => (el.id === selectedItem?.id || activeId === el.id)) 
                ? "!outline-dashed !outline-2 !outline-offset-4 !outline-yellow" 
                : ""
              }
            />
          )
          : (
            <SingleItem 
              key={indx}
              data={item.data}
              className={cn((selectedItem?.id === item.data.id || activeId === item.data.id)
                ? "!outline-yellow" 
                : "outline-transparent",
                "!outline-dashed !outline-2 !outline-offset-2 transition-all"
              )}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedItem(item.data)
                void setActiveId(null)
              }}
            />
          )
      )
      )}
    </Layer>
  )
}
