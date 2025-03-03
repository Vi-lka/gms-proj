import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type UserRestrictions, type UserRole, type ApproxEnumT, type RelevanceKeys, type MaxValue } from "./types"
import translateData from "./static/translate-data"
import { type Profitability } from "~/server/db/schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function intervalToString(
  start: number | string | null, 
  end: number | string | null
): string {
  if (!start) return ""
  if (!end) return start.toString()
  return `${start} - ${end}`
}

export function formatDate(
  date: Date | string | number,
  opts: Intl.DateTimeFormatOptions = {
    timeZone: "GMT"
  }
) {
  return new Intl.DateTimeFormat("ru-RU", {
    month: opts.month ?? "long",
    day: opts.day ?? "numeric",
    year: opts.year ?? "numeric",
    ...opts,
  }).format(new Date(date))
}

export function formatApproxNumber(
  number: number | null, 
  approx: ApproxEnumT | null
) {
  if (!number) return null
  if (!approx) return number
  return `${approx}${number}`
}

export function toSentenceCase(str: string) {
  return str
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim()
}

export function idToSentenceCase(str: string) {
  const entries = Object.entries(translateData)
  const finded = entries.find(entry => entry[0] === str)?.[1] ?? toSentenceCase(str)
  return finded
}

/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/core/primitive/src/primitive.tsx
 */
export function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
) {
  return function handleEvent(event: E) {
    originalEventHandler?.(event)

    if (
      checkForDefaultPrevented === false ||
      !(event as unknown as Event).defaultPrevented
    ) {
      return ourEventHandler?.(event)
    }
  }
}

export function containsInArrays(arr1: unknown[], arr2: unknown[]) {
  const strArr1 = arr1.map(item => JSON.stringify(item))
  const strArr2 = arr2.map(item => JSON.stringify(item))
  return strArr1.some(item => strArr2.includes(item));
}

export function areObjectsEqual(obj1: unknown, obj2: unknown): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export function combineArraysWithCommonElements<T>(arrays: T[][]): T[][] {
  const result: T[][] = [];
  // const uniqResult: T[][] = [];
  const visited: boolean[] = new Array(arrays.length).fill(false) as boolean[];

  for (let i = 0; i < arrays.length; i++) {
      if (visited[i]) continue; // Skip already processed arrays

      const combinedSet = new Set<T>(arrays[i]); // Start with the current array
      const stack: number[] = [i]; // Use a stack to explore connected components

      while (stack.length > 0) {
          const currentIndex = stack.pop()!;
          visited[currentIndex] = true; // Mark this array as visited

          for (let j = 0; j < arrays.length; j++) {
              if (visited[j]) continue; // Skip already processed arrays

              // Check for common elements using the custom equality function
              const hasCommonElement = arrays[currentIndex]?.some(element1 =>
                  arrays[j]?.some(element2 => areObjectsEqual(element1, element2))
              );

              if (hasCommonElement) {
                  // Combine arrays and add unique elements to the set
                  arrays[j]?.forEach(element => combinedSet.add(element));
                  stack.push(j); // Add this array to the stack for further exploration
              }
          }
      }

      // Add the combined unique array to the result
      result.push(Array.from(combinedSet));
  }

  const uniqResult = result.map(arr => {
    const set  = new Set(arr.map(item => JSON.stringify(item)));
    const uniqArr = Array.from(set).map(item => JSON.parse(item) as T)
    
    return uniqArr
  })

  return uniqResult;
}

export function restrictUser(role: UserRole | undefined, restriction: UserRestrictions) {
  if (!role || role === 'unknown') return true; // Restrict unknown users by default

  if ((role === 'guest' || role === 'user') && restriction !== 'content')
    return true // Restrict guest and user to view admin panel

  if (role === "admin" && restriction === "admin-panel-users") 
    return true // Restrict admin to view admin panel users

  if (role === "super-admin") return false // Super admin can view everything

  return false
}

export function splitIntoPairs<T>(array: T[]): T[][] {
  const result: T[][] = [];
  
  for (let i = 0; i < array.length; i += 2) {
      const pair = array.slice(i, i + 2);
      result.push(pair);
  }
  
  return result;
}

export const testProfitability: Profitability = {
  id: "testProfitability",
  lithium: 1,
  rubidium: 1,
  cesium: 1,
  boron: 1,
  iodine: 1,
  sodium: 1,
  calcium: 1,
  magnesium: 1,
  potassium: 1,
  chlorine: 1,
  bromine: 1,
  strontium: 1,
  barium: 1,
  aluminum: 1,
  selenium: 1,
  silicon: 1,
  manganese: 1,
  copper: 1,
  zinc: 1,
  silver: 1,
  tungsten: 1,
  titanium: 1,
  vanadium: 1,
  chromium: 1,
  cobalt: 1,
  nickel: 1,
  arsenic: 1,
  molybdenum: 1,
  plumbum: 1,
  bismuth: 1,
  sulfateIon: 1,
  bicarbonate: 1,
  carbonateIon: 1,
  ammonium: 1,
  fluorine: 1,
  nitrogenDioxide: 1,
  nitrate: 1,
  phosphate: 1,
  ferrum: 1,
}


export function findMaxValuesByRelevance<T extends Record<string, string | number | null>>(
  data: Array<Partial<Record<RelevanceKeys<T>, number | null>>>,
  relevanceObj: T
): MaxValue<T>[] {
  if (typeof relevanceObj !== 'object' || relevanceObj === null) {
    throw new Error('relevanceObj must be an object');
  }

  if (!Array.isArray(data)) {
    throw new Error('data must be an array');
  }

  const maxValues: MaxValue<T>[] = [];

  // go through each key from relevanceObj
  for (const key in relevanceObj) {
    let maxWeightedValue = -Infinity;
    let maxOriginalValue: number | undefined;

    // finding the maximum value for the current key
    data.forEach(item => {
      if (
        key in item
        && 
        typeof item[key] === 'number' && typeof relevanceObj[key] === 'number'
      ) {
        const weightedValue = item[key] / relevanceObj[key];
        if (weightedValue > maxWeightedValue) {
          maxWeightedValue = weightedValue;
          maxOriginalValue = item[key]; 
        }
      }
    });

    // write down the maximum value
    if (maxOriginalValue !== undefined) {
      maxValues.push({key, originalValue: maxOriginalValue, weightedValue: maxWeightedValue});
    }
  }

  maxValues.sort((a, b) => b.weightedValue - a.weightedValue);

  return maxValues;
}

export function setNullByKeys<T extends Record<string, unknown>>(
  objectsArray: T[],
  keysArray: string[]
): T[] {
  return objectsArray.map(obj => {
    const newObj = { ...obj };
    Object.keys(obj).forEach(key => {
      if (!keysArray.includes(key)) {
        (newObj as Record<string, unknown>)[key] = null;
      }
    });
    return newObj;
  });
}

export function extractKeys<T extends string>(
  objectsArray: Array<Partial<Record<T, number | null>>>,
  keysArray: T[]
): Array<Partial<Record<T, number | null>>> {

  const result: Array<Partial<Record<T, number | null>>> = [];
  
  objectsArray.forEach(obj => {

    const newObj: Partial<Record<T, number | null>> = {};

    Object.keys(obj).forEach(key => {
      if (keysArray.includes(key as T)) {
        newObj[key as T] = obj[key as T]
      }
    });
    result.push(newObj);
  });

  return result
}