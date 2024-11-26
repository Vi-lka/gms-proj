import React from 'react'
import { ThemeProvider } from './theme-provider'
import JotaiProvider from './jotai-provider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from './toaster'

export default function Providers({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <NuqsAdapter>
      <JotaiProvider>
        <ThemeProvider
          attribute="class" 
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </JotaiProvider>
    </NuqsAdapter>
  )
}
