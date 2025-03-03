import { Loader } from 'lucide-react'
import React from 'react'

export default function loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Loader className="h-8 w-8 animate-spin" />
      <p className="">Загрузка...</p>
    </div>
  )
}
