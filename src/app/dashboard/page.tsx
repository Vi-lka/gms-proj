import { ArrowLeftToLine } from 'lucide-react'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import React from 'react'
import GoBack from '~/components/navigation/go-back'
import { auth, signIn } from '~/server/auth'
import { providerMap } from '~/server/auth/config'
import SignInForm from './sign-in'

type Params = Promise<{ slug: string }>
type SearchParams = Promise<{ callbackUrl: string | undefined, code: string | undefined }>

export default async function DashboardPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams

  const session = await auth()

  if (!session?.user) return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <GoBack
        variant="ghost"
        className='absolute left-4 top-4 md:left-8 md:top-8'
      >
        <ArrowLeftToLine />
        Назад
      </GoBack>
      <div className="mx-auto flex w-5/6 flex-col justify-center space-y-6 sm:max-w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Вход
          </h1>
          <p className="text-sm text-muted-foreground">
            Выберите предпочитаемый метод
          </p>
        </div>
        <SignInForm callbackUrl={searchParams.callbackUrl} />
      </div>
    </div>
  )

  if (session.user.role === "admin") return (
    <div>Dashboard</div>
  )

  redirect("/")
}
