"use client"

import React from 'react'
import useEventListener from "./use-event-listener"

// TODO: fix this - height is always get bigger and bigger
const useElementDimensions = () => {
  const ref = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState<DOMRect | null>(null)

  const refresh = React.useCallback((ev?: Event) => {
    if ((ev?.target === window) || (ev?.target === undefined)) {
      const domRect = ref.current?.getBoundingClientRect()

      if (domRect) {
        setDimensions(domRect)
      }  
    }
  }, [])

  useEventListener('resize', refresh);
  useEventListener('scroll', refresh, true);

  return { dimensions, ref, refresh }
}

export default useElementDimensions