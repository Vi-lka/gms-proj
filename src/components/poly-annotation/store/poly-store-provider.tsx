"use client"

import React from 'react'
import { createPolyStore, type PolyAnnotationTemporalState, type PolyAnnotationStore } from '.'
import { useStore } from 'zustand'
import { useStoreWithEqualityFn } from 'zustand/traditional';
import { type TemporalState } from 'zundo'

export type PolyStoreApi = ReturnType<typeof createPolyStore>

export const PolyStoreContext = React.createContext<PolyStoreApi | undefined>(
  undefined,
)

export interface PolyStoreProviderProps {
  children: React.ReactNode
}

export const PolyStoreProvider = ({
  children,
}: PolyStoreProviderProps) => {
  const storeRef = React.useRef<PolyStoreApi>(null)
  if (!storeRef.current) {
    storeRef.current = createPolyStore()
  }

  return (
    <PolyStoreContext.Provider value={storeRef.current}>
      {children}
    </PolyStoreContext.Provider>
  )
}

export const usePolyStore = <T,>(
  selector: (store: PolyAnnotationStore) => T,
): T => {
  const polyStoreContext = React.useContext(PolyStoreContext)

  if (!polyStoreContext) {
    throw new Error(`usePolyStore must be used within PolyStoreProvider`)
  }

  return useStore(polyStoreContext, selector)
}

export const useTemporalStore = <T,>(
  selector: (state: TemporalState<PolyAnnotationTemporalState>) => T,
  equality?: (a: T, b: T) => boolean,
) => {
  const polyStoreContext = React.useContext(PolyStoreContext)

  if (!polyStoreContext) {
    throw new Error(`useTemporalStore must be used within PolyStoreProvider`)
  }

  return useStoreWithEqualityFn(polyStoreContext.temporal, selector, equality);
}