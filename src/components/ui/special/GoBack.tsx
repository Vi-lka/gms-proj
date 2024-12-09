"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button, type ButtonProps } from '../button';

const GoBack = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => {

      const router = useRouter();

      return (
        <Button 
            ref={ref} 
            {...props}
            onClick={() => router.back()}
        />
      )
    }
  )
  GoBack.displayName = "GoBack"
  
export default GoBack
