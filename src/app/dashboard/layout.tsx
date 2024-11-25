import { redirect } from 'next/navigation'
import type React from 'react'
import AdminPanelLayout from '~/components/admin-panel/admin-panel-layout'
import { auth } from '~/server/auth'

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()

  if (!session?.user) return children

  if (session.user.role === "admin") return (
    <AdminPanelLayout>{children}</AdminPanelLayout>
  )

  redirect("/")
}
