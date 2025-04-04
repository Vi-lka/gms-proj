"use client"

import { AlertCircle, SkipBack } from 'lucide-react'
import * as Sentry from "@sentry/nextjs";
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { Button } from '~/components/ui/button'
import ReportErrorButton from '../ui/special/report-error-button';

enum ErrorEnum {
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
  const error = search.get("error") as ErrorEnum | undefined

  const router = useRouter()

  useEffect(() => {
    if (error) {
      // Log the error to an error reporting service
      Sentry.captureException(new Error(`AuthError: ${error}`));
      console.error(error)
    }
  }, [error])

  if (!error) return null;
  
  return (
    <div className="relative p-8 bg-background rounded-lg shadow-md max-w-md w-full">
      <Button 
        variant="ghost" 
        className='absolute top-2 left-2 text-muted-foreground aspect-square w-fit h-fit p-2' 
        onClick={() => router.back()}
      >
        <SkipBack size={18} />
      </Button>
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
        <Button variant="outline" onClick={() => router.refresh()}>
          Перезагрузить
        </Button>
        <ReportErrorButton />
      </div>
    </div>
  )
}
