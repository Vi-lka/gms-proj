import type { Row, ColumnSort } from "@tanstack/react-table"
import { z } from "zod"
import type { filterSchema } from "../parsers"
import type { DataTableConfig } from "../config/data-table"
import type { roleEnum } from "~/server/db/schema"
import type { AnyColumn, SQL, SQLWrapper } from "drizzle-orm"
import { approxEnum } from "~/server/db/schema/fields"

export * from "./map"

export type UserRole = typeof roleEnum.enumValues[number]

export type UserRestrictions = 'content' | 'admin-panel' | 'admin-panel-users'

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type StringKeyOf<TData> = Extract<keyof TData, string>

export type SearchParams = Record<string, string | string[] | undefined>;

export interface PageProps {
  searchParams: Promise<SearchParams>
}

export interface Option {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
  count?: number
}

export interface ExtendedColumnSort<TData> extends Omit<ColumnSort, "id"> {
  id: StringKeyOf<TData>
}

export type ExtendedSortingState<TData> = ExtendedColumnSort<TData>[]

export type ColumnType = DataTableConfig["columnTypes"][number]

export type FilterOperator = DataTableConfig["globalOperators"][number]

export type JoinOperator = DataTableConfig["joinOperators"][number]["value"]

export type SortFieldConfig<T> = {
  key: keyof T;
  column: AnyColumn | SQLWrapper;
};

export interface DataTableFilterField<TData> {
  id: StringKeyOf<TData>
  label: string
  placeholder?: string
  disabled?: boolean
  options?: Option[]
}

export interface DataTableAdvancedFilterField<TData>
  extends DataTableFilterField<TData> {
  type: ColumnType
}

export type Filter<TData> = Prettify<
  Omit<z.infer<typeof filterSchema>, "id"> & {
    id: StringKeyOf<TData>
  }
>

export interface DataTableRowAction<TData> {
  row: Row<TData>
  type: "create" | "update" | "delete" | "dialog"
}

export interface QueryBuilderOpts {
  where?: SQL
  orderBy?: SQL
  distinct?: boolean
  nullish?: boolean
}

export const approxEnumSchema = z.enum(approxEnum.enumValues);
export type ApproxEnumT = z.infer<typeof approxEnumSchema>

export type RecentItem = {
  id: string;
  title: string | undefined;
  type: "mapItem" | "cluster" | "company" | "field" | "licensedArea" | "areaData" | "fieldMap" | "polygon" | "file" | "profitability" | "mapData" | "user";
  createUserId: string | null;
  updateUserId: string | null;
  createUserName: string | null;
  updateUserName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type GetAllQueryParams = {
  where: SQL<unknown>,
  keys: string[]
}

export interface ErrorWithEventId extends Error {
  eventId: string
}