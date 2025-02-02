import { redirect } from 'next/navigation'
import type React from 'react'
import AdminPanelLayout from '~/components/admin-panel/admin-panel-layout/admin-panel-layout.server'
import { restrictUser } from '~/lib/utils'
import { auth } from '~/server/auth'

export default async function DashboardTemplate({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()

  if (!session?.user) return children

  if (!restrictUser(session.user.role, 'admin-panel')) return (
    <AdminPanelLayout>{children}</AdminPanelLayout>
  )

  redirect("/")
}
