"use client"

import { AlertCircle, Undo2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React from 'react'
import InterseptingModal from '~/components/navigation/intersepting-modal'
import { Button } from '~/components/ui/button'

export default function ErrorAreaModal({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter();

  return (
    <InterseptingModal modal={false} title={"Ошибка!"} className="h-[calc(100vh-60px)]">
      <div className="flex flex-col items-center justify-center flex-grow bg-muted rounded-2xl">
        <div className="p-8 bg-background rounded-lg shadow-md max-w-md w-full">
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
            <Button onClick={() => router.back()} className="w-full">
              Вернуться <Undo2 className='flex-none' />
            </Button>
          </div>
        </div>
      </div>
    </InterseptingModal>
  )
}
