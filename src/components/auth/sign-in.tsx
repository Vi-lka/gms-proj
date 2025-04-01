"use client"

import { signIn } from 'next-auth/react';
import React from 'react'
import { IconByName, Icons } from '~/components/icons';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import revalidateTag from '~/server/actions/revalidateTag';
import AuthErrorCard from './auth-error-card';

interface SignInFormProps extends React.HTMLAttributes<HTMLDivElement> {
  providers: {
    id: string;
    name: string;
  }[],
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
      if (error) {
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
    revalidateTag("users")
    revalidateTag("users-role-counts")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-5/6 flex-col justify-center space-y-6 sm:max-w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Вход
          </h1>
          <p className="text-sm text-muted-foreground">
            Выберите предпочитаемый метод
          </p>
        </div>
        <AuthErrorCard />
        <div className={cn("grid gap-6", className)} {...otherProps}>
          {props.providers.map((provider) => (
            <Button 
              key={provider.id} 
              variant="outline" 
              type="button" 
              disabled={isLoading} 
              onClick={() => onSubmit(provider.id)}
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconByName name={provider.id} className="text-foreground stroke-foreground mr-2 h-4 w-4" />
              )}{" "}
              {provider.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
