"use client"

import React from 'react'
import useEventListener from "./use-event-listener"

const useElementDimensions = () => {
  const ref = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState<DOMRect | null>(null)

  const refresh = React.useCallback(() => {
    const domRect = ref.current?.getBoundingClientRect()

    if (domRect) {
      setDimensions(domRect)
    }
  }, [])

  useEventListener('resize', refresh);
  useEventListener('scroll', refresh, true);

  return { dimensions, ref, refresh }
}

export default useElementDimensions