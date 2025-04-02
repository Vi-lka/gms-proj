"use client"

import React from 'react'
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from '~/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    Sentry.captureException(error);
    console.error(error)
  }, [error])

  return (
    <html 
      lang="ru" 
      suppressHydrationWarning
    >
      <body className="font-sans bg-background">
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted">
          <div className="p-8 bg-background rounded-lg shadow-md max-w-md w-full">
            <div className="flex items-center justify-center text-destructive mb-4">
              <AlertCircle size={48} />
            </div>
            <h1 className="text-2xl text-foreground font-bold text-center mb-4">Ошибка! Что-то пошло не так</h1>
            <p className="text-foreground/70 text-center mb-6">
              {error.message}
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => reset()}>
                Попробовать снова
              </Button>
              <Button onClick={() => {
                const eventId = Sentry.lastEventId();
                Sentry.showReportDialog({ 
                  eventId,
                  lang: "ru",
                  // user: {
                  //   name: "Dmitry",
                  //   email: "mymail@example.com"
                  // },
                  title: "Похоже, у нас возникли проблемы.",
                  subtitle: "Наша команда была уведомлена.",
                  subtitle2: "Если вы хотите помочь, расскажите нам, что произошло.",
                  labelName: "Имя",
                  labelEmail: "Email",
                  labelComments: "Что произошло?",
                  labelClose: "Закрыть",
                  labelSubmit: "Отправить",
                  errorFormEntry: "Некоторые поля не валидны.",
                  successMessage: "Ваш отзыв отправлен. Спасибо!",
                });
              }}>
                Сообщить об ошибке
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}