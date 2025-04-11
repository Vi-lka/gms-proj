import { useAtom, useAtomValue } from 'jotai';
import React from 'react'
import { Layer } from 'react-konva';
import { mapContainerDimensions, selectedItemAtom, stageAtom } from '~/lib/atoms/main';
import getIntersections from '~/lib/intersections/get-intersections';
import valueFromWindowWidth from '~/lib/intersections/valueFromWindowWidth';
import GroupItem from './items/group-item';
import SingleItem from './items/single-item';
import { cn } from '~/lib/utils';
import { useRouter } from 'next/navigation';
import { type getMapItems } from '~/server/queries/map';
import { type getProfitability } from '~/server/queries/profitability';
import { useMapItems } from './filters/hooks';

export default function MapItems({
  data,
  profitability
}: {
  data: Awaited<ReturnType<typeof getMapItems>>['data'], 
  profitability: Awaited<ReturnType<typeof getProfitability>>['data']
}) {
  const items = useMapItems(data, profitability)

  const router = useRouter();

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
              data={item.data}
              className={cn(selectedItem?.id === item.data.id 
                ? "!outline-yellow" 
                : "outline-transparent",
                "!outline-dashed !outline-2 !outline-offset-2 transition-all"
              )}
              htmlClassName={selectedItem?.id === item.data.id ? "!z-[100]" : ""}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedItem(item.data)
                router.prefetch(`maps/${item.data.id}`)
              }}
              // handleClickOutside={() => {
              //   setSelectedItem(null)
              // }}
            />
          )
      )
      )}
    </Layer>
  )
}
