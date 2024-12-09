import { type MapGroupT, type MapItemT } from "../types";
import haveIntersection from "./have-intersection";

export const DEFAULT_ITEM_SIZE = {
  width: 100,
  height: 100
}

export default function getIntersections(data: MapItemT[], scale: number) {
  const dataGroups: MapGroupT[] = []

  const intersections = data.map(item => {
    return {
      current: item,
      intersections: [] as MapItemT[]
    }
  })
  // Find intersections for each element
  data.forEach((first) => {
      data.forEach((second) => {
      if (first.id === second.id) return;

      const firstAttrs = {
        x: first.x,
        y: first.y,
        width: DEFAULT_ITEM_SIZE.width*(1/scale), 
        height: DEFAULT_ITEM_SIZE.height*(1/scale)
      };
      const secondAttrs = {
        x: second.x,
        y: second.y,
        width: DEFAULT_ITEM_SIZE.width*(1/scale), 
        height: DEFAULT_ITEM_SIZE.height*(1/scale)
      };

      if (haveIntersection(firstAttrs, secondAttrs)) {
        intersections.find((item) => item.current.id === first.id)?.intersections.push(second);
      }
    })
  })

  const intersectionItems: MapItemT[][] = []
  const singleItems: MapItemT[] = []

  const intersectionsArrs: MapItemT[][] = []
  intersections.forEach((item) => {    
    if (item.intersections.length > 0) {
      // Get arrays of intersections  
      const arr = [item.current, ...item.intersections].sort((a, b) => a.id.localeCompare(b.id))
      intersectionsArrs.push(arr)
    } else {
      // Get arrays of NO intersections
      singleItems.push(item.current)
    }
  })
  const set  = new Set(intersectionsArrs.map(item => JSON.stringify(item)));
  const uniqIntersections = Array.from(set).map(item => JSON.parse(item) as MapItemT[])
  intersectionItems.push(...uniqIntersections)

  // Get groups for render 
  intersectionItems.forEach(item => {
    dataGroups.push({intersection: true, items: item})
  })
  singleItems.forEach(item => {
    dataGroups.push({intersection: false, items: item})
  })

  const uniqDataGroups = dataGroups.filter((obj, index, arr) => {
    return arr.findIndex(o => {
      return JSON.stringify(o) === JSON.stringify(obj)
    }) === index
  });

  return uniqDataGroups
}