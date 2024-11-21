import { SessionProvider } from 'next-auth/react'
import React from 'react'
import { auth } from '~/server/auth'
import AuthButtonClient from './AuthButton.client'

export default async function AuthButton() {
  const session = await auth()
  
  return (
    <SessionProvider session={session}>
      <AuthButtonClient />
    </SessionProvider>
  )
}
