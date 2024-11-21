"use client"

import React from 'react'
import { Provider as JotaiProvider } from "jotai"
import { ThemeProvider } from './theme-provider'

export default function Providers({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <JotaiProvider>
      <ThemeProvider
        attribute="class" 
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </JotaiProvider>
  )
}
