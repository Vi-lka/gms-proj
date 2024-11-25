import { redirect } from 'next/navigation'
import type React from 'react'
import { auth } from '~/server/auth'

export default async function DashboardTemplate({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()

  if (!session?.user || session.user.role === "admin") return (
    children
  )
  
  redirect("/")
}
