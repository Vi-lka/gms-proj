import { type Cluster, type CompanyExtend, type Field } from "~/server/db/schema";

export type MapItemT = {
  id: string,
  companies: CompanyExtend[];
  fields: Field[]
  cluster: Cluster | null;
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