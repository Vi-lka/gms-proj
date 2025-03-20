import { redirect } from 'next/navigation';
import React from 'react'
import { type PageProps } from '~/lib/types'
import { auth } from '~/server/auth';

export default async function FilesPage(props: PageProps) {
  const session = await auth();

  if (!session) redirect("/dashboard");

  // TODO: FilesPage
  return (
    <div>page</div>
  )
}
