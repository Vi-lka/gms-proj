import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'
import { ContentLayout } from '~/components/admin-panel/content-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { auth } from '~/server/auth';
import { getMap, getMapItems } from '~/server/queries/map';
import Map from "./Map";
import DefaultLoading from '~/components/loadings/default';
import { getProfitability } from '~/server/queries/profitability';

export default async function MapPage() {
  const session = await auth();

  if (!session) redirect("/dashboard");

  const promises = Promise.all([
    getMapItems(),
    getMap(),
    getProfitability()
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
              <Link href="/dashboard">Панель</Link>
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
          fallback={<DefaultLoading />}
        >
          <Map promises={promises} />
        </React.Suspense>
      </div>
    </ContentLayout>
  )
}