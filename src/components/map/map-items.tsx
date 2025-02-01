import { useAtom, useAtomValue } from 'jotai';
import React from 'react'
import { Layer } from 'react-konva';
import { mapContainerDimensions, selectedItemAtom, stageAtom } from '~/lib/atoms/main';
import getIntersections from '~/lib/intersections/get-intersections';
import valueFromWindowWidth from '~/lib/intersections/valueFromWindowWidth';
import { type MapItemT } from '~/lib/types'
import GroupItem from './items/group-item';
import SingleItem from './items/single-item';
import { cn } from '~/lib/utils';

export default function MapItems({
  items
}: {
  items: MapItemT[]
}) {
  const stage = useAtomValue(stageAtom);
  const { width: windowW } = useAtomValue(mapContainerDimensions);

  const [selectedItem, setSelectedItem] = useAtom(selectedItemAtom)

  const scaleForIntersections = valueFromWindowWidth({
    windowW,
    w1024: 0.7*stage.scale,
    w425: 0.4*stage.scale,
    minw: 0.3*stage.scale,
  })

  const intersections = React.useMemo(
    () => getIntersections(items, scaleForIntersections),
    [items, scaleForIntersections]
  );

  return (
    <Layer>
      {intersections.map((item, indx) => (
        item.intersection
          ? (
            <GroupItem
              key={indx}
              data={item}
              className={item.items.find(el => el.id === selectedItem?.id) 
                ? "!outline-dashed !outline-2 !outline-offset-4 !outline-yellow" 
                : ""
              }
            />
          )
          : (
            <SingleItem 
              key={indx}
              data={item.items}
              className={cn(selectedItem?.id === item.items.id 
                ? "!outline-yellow" 
                : "outline-transparent",
                "!outline-dashed !outline-2 !outline-offset-2 transition-all"
              )}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedItem(item.items)
              }}
              handleClickOutside={() => {
                setSelectedItem(null)
              }}
            />
          )
      )
      )}
    </Layer>
  )
}
