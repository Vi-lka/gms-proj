"use client"

import { Undo2 } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React from 'react'
import InterseptingModal from '~/components/navigation/intersepting-modal'
import { Button } from '~/components/ui/button'

export default function NotFoundAreaModal() {
  const router = useRouter();

  return (
    <InterseptingModal modal={false} title={"Не найдено"} className="h-[calc(100vh-60px)]">
      <div className="flex flex-col items-center justify-center flex-grow bg-muted rounded-2xl">
        <div className="p-8 bg-background rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404</h1>
          </div>
          <p className="text-foreground/70 text-center mb-6">
            Не найдено
          </p>
          <div className="flex flex-col justify-center items-center gap-4">
            <Button onClick={() => router.back()} className="w-full">
              Вернуться <Undo2 className='flex-none' />
            </Button>
          </div>
        </div>
      </div>
    </InterseptingModal>
  )
}
