"use client"

import { AuthError } from 'next-auth';
import { signIn } from 'next-auth/react';
import React from 'react'
import { Icons } from '~/components/icons';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface SignInFormProps extends React.HTMLAttributes<HTMLDivElement> {
  callbackUrl: string | undefined
}

export default function SignInForm({ className, ...props }: SignInFormProps) {

  const {callbackUrl, ...otherProps} = props

  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  async function onSubmit(provider: string) {
    setIsLoading(true)
    try {
      await signIn(
        provider,
        { redirectTo: callbackUrl ?? "" }
      )
    } catch (error) {
      // Signin can fail for a number of reasons, such as the user
      // not existing, or the user not having the correct role.
      // In some cases, you may want to redirect to a custom error
      if (error instanceof AuthError) {
        // return redirect(`${SIGNIN_ERROR_URL}?error=${error.type}`)
        console.error(error)
      }

      // Otherwise if a redirects happens Next.js can handle it
      // so you can just re-thrown the error and let Next.js handle it.
      // Docs:
      // https://nextjs.org/docs/app/api-reference/functions/redirect#server-component
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...otherProps}>
      <div className="grid gap-2">
        <Button variant="outline" type="button" disabled={isLoading} onClick={() => onSubmit("github")}>
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.gitHub className="mr-2 h-4 w-4" />
          )}{" "}
          GitHub
        </Button>
        <Button variant="outline" type="button" disabled={isLoading} onClick={() => onSubmit("google")}>
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}{" "}
          Google
        </Button>
        <Button variant="outline" type="button" disabled={isLoading} onClick={() => onSubmit("yandex")}>
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.yandex className="mr-2 h-4 w-4" />
          )}{" "}
          Yandex
        </Button>
        <Button variant="outline" type="button" disabled={isLoading} onClick={() => onSubmit("vk")}>
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.vk className="mr-2 h-4 w-4" />
          )}{" "}
          VK
        </Button>
      </div>
    </div>
  )
}
