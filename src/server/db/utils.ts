import {
  not,
  sql,
  type AnyColumn,
  type SQL,
} from "drizzle-orm"
import { type PgColumn } from "drizzle-orm/pg-core"

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
    throw new Error("First item not found")
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

  // const sqlChunks: SQL[] = [];

  // sqlChunks.push(sql`(case`);

  // for (const input of inputs) {
  //   sqlChunks.push(sql`when ${id} = ${input.id} then ${input[inputKey]}`);
  // }

  // sqlChunks.push(sql`end)`);

  // const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));

  // return finalSql
}