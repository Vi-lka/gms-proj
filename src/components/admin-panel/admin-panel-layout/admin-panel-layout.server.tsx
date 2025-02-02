import { SessionProvider } from 'next-auth/react'
import React from 'react'
import { auth } from '~/server/auth'
import AdminPanelLayoutClient from './admin-panel-layout.client'

export default async function AdminPanelLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <AdminPanelLayoutClient>
        {children}
      </AdminPanelLayoutClient>
    </SessionProvider>
  )
}
