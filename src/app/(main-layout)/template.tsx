import { SessionProvider } from 'next-auth/react'
import { redirect } from 'next/navigation'
import type React from 'react'
import { restrictUser } from '~/lib/utils'
import { auth } from '~/server/auth'

export default async function MainTemplate({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()

  if (!session?.user) redirect('/sign-in')

  if (restrictUser(session.user.role, 'content')) redirect('/')

  return (
    <SessionProvider session={session}>
      <div className='flex flex-col flex-grow' style={{userSelect: session.user.role === "guest" ? "none" : "auto"}}>
        {children}
      </div>
    </SessionProvider>
  )
}
