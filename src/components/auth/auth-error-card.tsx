"use client"

import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { Button } from '~/components/ui/button'

enum Error {
  Configuration = "Configuration",
  AccessDenied = "AccessDenied",
  Verification = "Verification",
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

export default function AuthErrorCard() {
  const search = useSearchParams()
  const error = search.get("error") as Error | undefined

  const router = useRouter()

  useEffect(() => {
    if (error) {
      // Log the error to an error reporting service
      console.error(error)
    }
  }, [error])

  if (!error) return null;
  
  return (
    <div className="p-8 bg-background rounded-lg shadow-md max-w-md w-full">
      <div className="flex items-center justify-center text-destructive mb-4">
        <AlertCircle size={48} />
      </div>
      <h1 className="text-2xl text-foreground font-bold text-center mb-4">Ошибка! Что-то пошло не так</h1>
      <div className="mb-6 text-center">
        <p className="text-foreground/70 text-center">
          Возникла проблема при попытке аутентификации. Свяжитесь с нами, если эта
          ошибка повторяется. Уникальный код ошибки:
        </p>
        <p className="mt-1">
          <code className="rounded-md bg-muted shadow-md p-2 text-xs">{error.toString()}</code>
        </p>
      </div>
      <div className="flex justify-center space-x-4">
        <Button onClick={() => router.refresh()} variant="outline">
          Перезагрузить
        </Button>
        <Link href="/" passHref>
          <Button>Вернуться на главную</Button>
        </Link>
      </div>
    </div>
  )
}
