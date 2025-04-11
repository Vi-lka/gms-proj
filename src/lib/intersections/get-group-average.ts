import { type MapItemT } from "../types";

export function calculateAverage(arr: number[]): number {
  if (arr.length === 0) return 0;

  const sum = arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  return sum / arr.length;
}

export default function getGroupAverage(items: MapItemT[]) {
  const xValues = items.map(itm => itm.x)
  const yValues = items.map(itm => itm.y)
  const widthValues = items.map(itm => itm.width).filter((itm): itm is number => !!itm)
  const heightValues = items.map(itm => itm.height).filter((itm): itm is number => !!itm)

  return {
    x: calculateAverage(xValues),
    y: calculateAverage(yValues),
    width: calculateAverage(widthValues),
    height: calculateAverage(heightValues),
  }
}
