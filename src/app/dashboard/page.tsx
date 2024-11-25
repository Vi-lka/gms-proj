import { redirect } from 'next/navigation'
import React from 'react'
import { auth } from '~/server/auth'
import { providerMap } from '~/server/auth/config'
import SignInForm from './(content)/sign-in'
import DashboardContent from './(content)'

type SearchParams = Promise<{ callbackUrl: string | undefined, code: string | undefined }>

export default async function DashboardPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams

  const session = await auth()

  const providers = Object.values(providerMap)

  if (!session?.user) return <SignInForm providers={providers} callbackUrl={searchParams.callbackUrl} />

  if (session.user.role === "admin") return <DashboardContent />

  redirect("/")
}
