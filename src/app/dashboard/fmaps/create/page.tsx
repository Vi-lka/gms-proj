import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'
import { ContentLayout } from '~/components/admin-panel/content-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { Skeleton } from '~/components/ui/skeleton';
import { auth } from '~/server/auth';
import { PolyStoreProvider } from '~/components/poly-annotation/store/poly-store-provider';
import EditPolygons from '~/components/admin-panel/edit-polygons/edit-polygons';

export default async function CreateFieldsMapsPage() {
  const session = await auth();

  if (!session) redirect("/dashboard");

  return (
    <ContentLayout title="Создать Карту Месторождения">
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
            <BreadcrumbLink asChild>
              <Link href="/dashboard/fmaps">Карты Месторождений</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Создать</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-6 flex flex-col flex-grow">
        <React.Suspense
          fallback={<Skeleton className='w-full min-h-[calc(100vh-290px)]' />}
        >
          <PolyStoreProvider>
            <EditPolygons type='create' />
          </PolyStoreProvider>
        </React.Suspense>
      </div>
    </ContentLayout>
  )
}
