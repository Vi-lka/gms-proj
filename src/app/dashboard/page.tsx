import { redirect } from 'next/navigation'
import React from 'react'
import { auth } from '~/server/auth'
import { providerMap } from '~/server/auth/config'
import SignInForm from '~/components/auth/sign-in'
import DashboardContent from '~/components/admin-panel/dashboard/dashboard-content'
import { ContentLayout } from '~/components/admin-panel/content-layout'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb'
import Link from 'next/link'

type SearchParams = Promise<{ callbackUrl: string | undefined, code: string | undefined }>

export default async function DashboardPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams

  const session = await auth()

  const providers = Object.values(providerMap)

  if (!session?.user) return <SignInForm providers={providers} callbackUrl={searchParams.callbackUrl} />

  if (session.user.role === "admin") return (
    <ContentLayout title="Dashboard">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Главная</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <DashboardContent />
      </div>
    </ContentLayout>
  )

  redirect("/")
}
