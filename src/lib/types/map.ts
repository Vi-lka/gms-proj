import { type FieldWithLicensedAreas, type AreaData, type Cluster, type CompanyWithListedAreas, type Profitability } from "~/server/db/schema";
import { type ApproxEnumT } from ".";

export type MapItemT = {
  id: string,
  companies: CompanyWithListedAreas[];
  areasData: AreaData[]
  maxElements: {
    filtered: MaxValue<Profitability>[],
    original: MaxValue<Profitability>[],
  }
  fields: FieldWithLicensedAreas[]
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

export type RelevanceKeys<T> = keyof T;

export type MaxValue<T> = {
  key: RelevanceKeys<T>, 
  originalValue: number, 
  weightedValue: number,
  approxValue: ApproxEnumT | null
}