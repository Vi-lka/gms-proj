import { redirect } from 'next/navigation'
import React from 'react'
import SignInForm from '~/components/auth/sign-in'
import { auth } from '~/server/auth'
import { providerMap } from '~/server/auth/config'

enum Error {
  Signin = "Signin",
  OAuthSignin = "OAuthSignin",
  OAuthCallbackError = "OAuthCallbackError",
  OAuthCreateAccount = "OAuthCreateAccount",
  EmailCreateAccount = "EmailCreateAccount",
  Callback = "Callback",
  OAuthAccountNotLinked = "OAuthAccountNotLinked",
  EmailSignin = "EmailSignin",
  CredentialsSignin = "CredentialsSignin",
  SessionRequired = "SessionRequired",
}

type SearchParams = Promise<{ callbackUrl: string | undefined, code: string | undefined, error: Error | undefined }>

export default async function SignInPage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams

  const session = await auth()

  const providers = Object.values(providerMap)

  if (!session?.user) return <SignInForm providers={providers} callbackUrl={searchParams.callbackUrl} />
  else redirect('/')
}
