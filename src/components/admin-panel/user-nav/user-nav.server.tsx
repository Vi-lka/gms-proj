import React from 'react'
import { auth } from '~/server/auth'
import UserNavClient from './user-nav.client'
import { SessionProvider } from 'next-auth/react'

export default async function UserNav() {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <UserNavClient />
    </SessionProvider>
  )
}
