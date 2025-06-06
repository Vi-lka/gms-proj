"use client"

import { useAtomValue } from "jotai";
import { mainImageAtom, mapContainerDimensions } from "~/lib/atoms/main";
// import { DEFAULT_ITEM_SIZE } from "~/lib/intersections/get-intersections";

const defaultRel = (size: number) => {
  return size/1000
}

export function useStageEllementPos( 
  size: {width?: number, height?: number},
  pos: {x: number, y: number}
) {
  const { width: windowW, height: windowH } = useAtomValue(mapContainerDimensions);

  const mainImage = useAtomValue(mainImageAtom)

  // const itemW = (size.width && size.width > 0) ? size.width : 1
  // const itemH = (size.height && size.height > 0) ? size.height : 1
  const itemW = 1
  const itemH = 1

  const relativeW = defaultRel(mainImage.size.width)*itemW
  const relativeH = defaultRel(mainImage.size.height)*itemH

  const relativeX = defaultRel(mainImage.size.width)*pos.x
  const relativeY = defaultRel(mainImage.size.height)*pos.y

  /* 
    calculate the offsets so the object is centered inside
    the canvas
  */
  const xOffset = (windowW - relativeW) / 2;
  const yOffset = (windowH - relativeH) / 2;

  const width = relativeW
  const height = relativeH
  const x = xOffset + relativeX
  const y = yOffset - relativeY

  return ({
    size: {width, height},
    pos: { x, y }
  });
}

export function useRevertStageEllementPos(
  pos: { x: number, y: number },
) {
  const { width: windowW, height: windowH } = useAtomValue(mapContainerDimensions);

  const mainImage = useAtomValue(mainImageAtom)

  // const itemW = (DEFAULT_ITEM_SIZE.width && DEFAULT_ITEM_SIZE.width > 0) ? DEFAULT_ITEM_SIZE.width : 1
  // const itemH = (DEFAULT_ITEM_SIZE.height && DEFAULT_ITEM_SIZE.height > 0) ? DEFAULT_ITEM_SIZE.height : 1
  const itemW = 1
  const itemH = 1

  const relativeW = defaultRel(mainImage.size.width)*itemW
  const relativeH = defaultRel(mainImage.size.height)*itemH

  /* 
    calculate the offsets so the object is centered inside
    the canvas
  */
  const xOffset = (windowW - relativeW) / 2;
  const yOffset = (windowH - relativeH) / 2;

  const relativeX = pos.x - xOffset
  const relativeY = yOffset - pos.y

  const width = relativeW
  const height = relativeH
  const x = relativeX / defaultRel(mainImage.size.width)
  const y = relativeY / defaultRel(mainImage.size.height)

  return ({
    size: {width, height},
    pos: { x, y }
  });
}