import { Loader } from 'lucide-react'
import React from 'react'
import { cn } from '~/lib/utils'

export default function DefaultLoading({
  className
}: {
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center flex-1 flex-grow justify-center', className)}>
      <div className="flex flex-col items-center flex-1 flex-grow justify-center space-y-4">
        <Loader className="h-8 w-8 animate-spin" />
        <p className="">Загрузка...</p>
      </div>
    </div>
  )
}
