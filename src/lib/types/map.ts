export type MapItemT = {
  id: string,
  names: string[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  scale?: number;
  svg?: string
}

export type IntersectionGroupT = {
  intersection: true,
  items: MapItemT[]
}
export type SingleItemGroupT = {
  intersection: false,
  items: MapItemT
}
export type MapGroupT = IntersectionGroupT | SingleItemGroupT