import {
  asc,
  desc,
  not,
  sql,
  type SQLWrapper,
  type TableConfig,
  type SQL,
  type BuildQueryConfig,
  type AnyColumn,
  lte,
  gte,
} from "drizzle-orm"
import { type PgTableWithColumns, type PgColumn } from "drizzle-orm/pg-core"
import type { SortFieldConfig, ExtendedColumnSort, ExtendedSortingState } from "~/lib/types"
import { customType } from 'drizzle-orm/pg-core'
import { type ElementsSearchSchema } from "~/lib/validations/search-params"
import { type areasData } from "./schema"
import { createHash } from "crypto";
import { CasingCache } from "drizzle-orm/casing"

export type NumericConfig = {
	precision?: number
	scale?: number
}

export const numericCasted = customType<{
	data: number
	driverData: string
	config: NumericConfig
}>({
	dataType: (config) => {
		if (config?.precision && config?.scale) {
			return `numeric(${config.precision}, ${config.scale})`
		}
		return 'numeric'
	},
	fromDriver: (value: string) => Number.parseFloat(value), // note: precision loss for very large/small digits so area to refactor if needed
	toDriver: (value: number) => value.toString(),
})

/**
 * Takes the first item from an array.
 *
 * @param items - The array to take the first item from.
 * @returns The first item from the array.
 */
export function takeFirst<TData>(items: TData[]) {
  return items.at(0)
}

/**
 * Takes the first item from an array or returns null if the array is empty.
 *
 * @param items - The array to take the first item from.
 * @returns The first item from the array or null.
 */
export function takeFirstOrNull<TData>(items: TData[]) {
  return takeFirst(items) ?? null
}

/**
 * Takes the first item from an array or throws an error if the array is empty.
 *
 * @param items - The array to take the first item from.
 * @returns The first item from the array.
 * @throws An error if the array is empty.
 */
export function takeFirstOrThrow<TData>(items: TData[]) {
  const first = takeFirst(items)

  if (!first) {
    throw new Error("Не найдено")
  }

  return first
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, or empty object).
 *
 * @param value - The value to check.
 * @returns A SQL expression that evaluates to true if the value is empty, false otherwise.
 */
export function isEmpty<TColumn extends AnyColumn>(column: TColumn) {
  return sql<boolean>`
    case
      when ${column} is null then true
      when ${column} = '' then true
      when ${column}::text = '[]' then true
      when ${column}::text = '{}' then true
      else false
    end
  `
}

/**
 * Checks if a value is not empty (not null, not undefined, not empty string, not empty array, and not empty object).
 *
 * @param value - The value to check.
 * @returns A SQL expression that evaluates to true if the value is not empty, false otherwise.
 */
export function isNotEmpty<TColumn extends AnyColumn>(column: TColumn) {
  return not(isEmpty(column))
}

interface MustBeInObject {
  id: string
}

export function updateInManySql<TData extends MustBeInObject>({
  id,
  inputs,
  // inputKey,
  inputKeys
}: {
  id: PgColumn,
  inputs: Array<TData>,
  // inputKey: keyof TData,
  inputKeys: Array<keyof TData>
}) {
  if (inputs.length === 0) return {};

  const result = inputKeys.map(inputKey => {
    const sqlChunks: SQL[] = [];
    sqlChunks.push(sql`(case`);

    for (const input of inputs) {
      sqlChunks.push(sql`when ${id} = ${input.id} then ${input[inputKey]}`);
    }
  
    sqlChunks.push(sql`end)`);

    const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));
  
    return {[inputKey]: finalSql}
  })
  .reduce((accum, curr) => {
    return { ...accum, ...curr };
  }, {}) as Record<keyof TData, SQL<unknown>>

  return result;
}

export function getTableOrderBy<IData, TData extends TableConfig>(
  item: ExtendedColumnSort<IData>, 
  table: PgTableWithColumns<TData>,
  notRelated?: boolean
) {
  if (item.id in table) {
    if (item.desc) return desc(table[item.id])
    else return asc(table[item.id])
  } else {
    if (notRelated) return item
  }
}

export function getRelationOrderBy<SData, TData extends TableConfig>(
  sort: ExtendedSortingState<SData>,
  table: PgTableWithColumns<TData>,
  defaultColumn: AnyColumn | SQLWrapper,
  relationColumns?: Extract<keyof SData, string>[]
) {
  const orderByUnClear = sort.length > 0
    ? sort.map((item) => getTableOrderBy(item, table))
    : [asc(defaultColumn)]
  const orderBy = orderByUnClear.filter((item): item is SQL<unknown> => !!item)

  const relationOrderBy = sort
    .map((item) => getTableOrderBy(item, table, true))
    .filter((item): item is ExtendedColumnSort<SData> => !!item)
    .filter((item) => relationColumns?.includes(item.id))

  return { orderBy, relationOrderBy }
}

export function generateSortFields<T>(
  config: SortFieldConfig<T>[]
): Record<keyof T, AnyColumn | SQLWrapper> {
  const sortFields = {} as Record<keyof T, AnyColumn | SQLWrapper>;

  config.forEach(({ key, column }) => {
    sortFields[key] = column;
  });

  return sortFields;
}

export function getOrderBy<T, TData extends TableConfig>({
  config,
  sortInput,
  defaultColumn,
  table,
}: {
  config: SortFieldConfig<T>[],
  sortInput: ExtendedSortingState<T>,
  defaultColumn: AnyColumn | SQLWrapper,
  table: PgTableWithColumns<TData>
}): SQL<unknown>[] {
  const sortFields = generateSortFields(config);

  let orderBy: (SQL<unknown> | undefined)[] = [];

  if (sortInput && sortInput.length > 0) {
    const orderByClauses = sortInput.map(({ id, desc: descV }) => {
      const tableColumn = table[String(id)];
      const column = tableColumn ?? sortFields[id];

      if (column) {
        return descV ? desc(column) : asc(column);
      }
      return undefined;
    });
    orderBy = orderByClauses;
  } else {
    orderBy = [asc(defaultColumn)];
  }

  return orderBy.filter((item): item is SQL<unknown> => !!item);
}

export function orderData<TData extends object>(
  sort: ExtendedSortingState<TData>,
  data: TData[]
) {
  return data.sort(fieldSorter(sort))
}

export function fieldSorter<TData extends object>(
  sort: ExtendedSortingState<TData>,
) {
  const dir: number[] = []
  const length = sort.length
  
  const fields = sort.map(function(itm, indx) {
    if (itm.desc) {
      dir[indx] = -1;
    } else {
      dir[indx] = 1;
    }
    return itm;
  });

  return function (a: TData, b: TData) {
    for (let i = 0; i < length; i++) {
      const field = fields[i]!.id;
      const valueA = a[field];
      const valueB = b[field];

      if (typeof valueA === "string" && typeof valueB === "string") {
        if (valueA.localeCompare(valueB) > 0) return dir[i]!;
        if (valueA.localeCompare(valueB) < 0) return -(dir[i]!);
      } else {
        if (valueA > valueB) return dir[i]!;
        if (valueA < valueB) return -(dir[i]!);
      }
    }
    return 0;
  };
}

export function compareElements(
  table: typeof areasData,
  input: ElementsSearchSchema[]
) {
  const compare: (SQLWrapper | undefined)[] = []

  input.forEach(item => {
    if (item.element === null) return;
    if (item.max !== null) compare.push(lte(table[item.element], item.max))
    if (item.min !== null) compare.push(gte(table[item.element], item.min))
  })

  return compare
}

export interface PaginationInput {
  page: number;
  perPage: number;
}
export interface PaginationResult<DataT> {
  items: DataT[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
/**
 * Pagination of an array of data
 * @param data Source data set
 * @param input Pagination parameters (page and perPage)
 * @returns Object with paginated data and metadata
 */
export function paginate<DataT>(data: DataT[], input: PaginationInput): PaginationResult<DataT> {
  const page = Math.max(1, input.page);
  const perPage = Math.max(10, input.perPage);
  
  const totalItems = data.length;
  
  const offset = (page - 1) * perPage;
  const items = data.slice(offset, offset + perPage);

  const totalPages = Math.ceil(totalItems / perPage);
  
  return {
    items,
    totalPages,
    currentPage: page,
    totalItems,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1
  };
}


// I`am not sure if this will work with any 'where'
const buildQueryConfig: BuildQueryConfig = {
  casing: new CasingCache(),
  escapeName: (name) => `"${name}"`,
  escapeParam: (num) => `$${num + 1}`,
  escapeString: (str) => `'${str.replace(/'/g, "''")}'`,
};
export function serializeWhere(where?: SQL<unknown>): string {
  const baseString = where
    ? JSON.stringify(where.toQuery(buildQueryConfig))
    : 'no-where';

  return createHash("sha256").update(baseString).digest("hex");
}