"use client"
import React from 'react'
import { Button, type ButtonProps } from '../ui/button'
import { useRouter } from 'next/navigation'

const GoBack = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => {

      const router = useRouter();

      return (
        <Button 
            ref={ref} 
            {...props}
            onClick={() => {
                if (history.length > 2) router.back()
                else router.push('/')
            }}
        />
      )
    }
  )
  GoBack.displayName = "GoBack"
  
export default GoBack