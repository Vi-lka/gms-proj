import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'
import { ContentLayout } from '~/components/admin-panel/content-layout';
import { PolyStoreProvider } from '~/components/poly-annotation/store/poly-store-provider';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { Skeleton } from '~/components/ui/skeleton';
import { auth } from '~/server/auth';
import Content from './content';
import { getFieldMapWithImage } from '~/server/queries/fields-maps';
import { Loader } from 'lucide-react';

export default async function EditFieldMapPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth();

  if (!session) redirect("/dashboard");

  const id = (await params).id

  const promises = Promise.all([
    getFieldMapWithImage(id)
  ])

  return (
    <ContentLayout title="Изменить Карту Месторождения">
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
            <BreadcrumbPage>Изменить</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-6 flex flex-col flex-grow">
        <React.Suspense
          fallback={
            <div className='w-full min-h-[calc(100vh-290px)] flex items-center justify-center'>
              <Loader className="h-8 w-8 animate-spin" />
            </div>
          }
        >
          <PolyStoreProvider>
            <Content promises={promises} />
          </PolyStoreProvider>
        </React.Suspense>
      </div>
    </ContentLayout>
  )
}
