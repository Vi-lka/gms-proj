import React from 'react'
import { ThemeProvider } from './theme-provider'
import JotaiProvider from './jotai-provider'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from './toaster'
import { SWRProvider } from './swr-provider'

export default function Providers({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <NuqsAdapter>
      <SWRProvider>
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
      </SWRProvider>
    </NuqsAdapter>
  )
}
