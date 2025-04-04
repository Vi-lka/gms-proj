"use client"

import React, { useEffect } from 'react'
import { AlertCircle, SkipBack } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import InterseptingModal from '~/components/navigation/intersepting-modal'
import { Button } from '~/components/ui/button'
import * as Sentry from "@sentry/nextjs";
import ReportErrorButton from '~/components/ui/special/report-error-button'

export default function ErrorAreaModal({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter();

  const session = useSession()

  useEffect(() => {
    // Log the error to an error reporting service
    Sentry.captureException(error);
    console.error(error)
  }, [error])

  return (
    <InterseptingModal modal={false} title={"Ошибка!"} className="h-[calc(100vh-60px)]">
      <div className="flex flex-col items-center justify-center flex-grow bg-muted rounded-2xl">
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
          <h1 className="text-2xl text-foreground font-bold text-center mb-4">Что-то пошло не так</h1>
          <p className="text-foreground/70 text-center mb-6">
            {error.message}
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => reset()} variant="outline">
              Попробовать снова
            </Button>
            <ReportErrorButton user={{
              name: session.data?.user.name ?? undefined,
              email: session.data?.user.email ?? undefined
            }}/>
          </div>
        </div>
      </div>
    </InterseptingModal>
  )
}
