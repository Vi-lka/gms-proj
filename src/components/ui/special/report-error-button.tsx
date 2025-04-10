"use client"

import React from 'react'
import { Button } from '../button';
import * as Sentry from "@sentry/nextjs";
import { env } from '~/env';
import { cn } from '~/lib/utils';

export default function ReportErrorButton({
  className,
  user
}: {
  className?: string,
  user?: {
    name?: string,
    email?: string
  },
}) {
  if (env.NEXT_PUBLIC_ENABLE_REPORTS !== "true") return null;

  return (
    <Button 
      className={cn("bg-foreground text-background", className)}
      onClick={() => {
        const eventId = Sentry.lastEventId();
        Sentry.showReportDialog({ 
          eventId,
          lang: "ru",
          user,
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
      }}
    >
      Сообщить об ошибке
    </Button>
  )
}
