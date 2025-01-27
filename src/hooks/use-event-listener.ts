/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'

const useEventListener = (
  event: any, 
  listener: (ev?: Event) => void,
  useCapture?: boolean
) => {
  useEffect(() => {
    if (listener) {
      listener()
      window.addEventListener(event, listener, useCapture)

      return () => window.removeEventListener(event, listener, useCapture)
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {}
  }, [event, listener, useCapture])
}

export default useEventListener