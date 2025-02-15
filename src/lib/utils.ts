import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { type UserRestrictions, type UserRole, type ApproxEnumT } from "./types"
import translateData from "./static/translate-data"
import { roleEnum } from "~/server/db/schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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