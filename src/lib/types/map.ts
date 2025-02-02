export type MapItemT = {
  id: string,
  companies: {
    id: string; 
    name: string;
    description: string | null;
  }[];
  cluster: {
    id: string;
    name: string;
    description: string | null;
  } | null;
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
  data: MapItemT
}
export type MapGroupT = IntersectionGroupT | SingleItemGroupT