"use client"

import { Undo2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
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
          <Link href="/" passHref>
            <Button variant="outline">На главную</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
