import { redirect } from 'next/navigation'
import type React from 'react'
import { restrictUser } from '~/lib/utils'
import { auth } from '~/server/auth'

export default async function DashboardUsersTemplate({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()

  if (!session || restrictUser(session?.user.role, 'admin-panel-users')) redirect("/dashboard");

  return children
}
