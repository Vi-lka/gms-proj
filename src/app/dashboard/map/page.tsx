import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'
import { ContentLayout } from '~/components/admin-panel/content-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { type PageProps } from '~/lib/types'
import { auth } from '~/server/auth';
import { getMap, getMapItems } from '~/server/queries/map';
import Map from "./Map";

export default async function MapPage(props: PageProps) {
  const session = await auth();

  if (!session) redirect("/dashboard");

  const promises = Promise.all([
    getMap(),
    getMapItems(),
  ])

  return (
    <ContentLayout title="Карта" container={false} className='max-h-[85vh]'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Главная</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Карта</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-6 flex flex-col flex-grow">
        <React.Suspense
          fallback={"Loading..."}
        >
          <Map promises={promises} />
        </React.Suspense>
      </div>
    </ContentLayout>
  )
}