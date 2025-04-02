import { toast, type ExternalToast } from "sonner";
import { Button } from "../button";
import * as Sentry from "@sentry/nextjs";
import { Megaphone } from "lucide-react";

export const errorToast = (
    message: React.ReactNode, 
    data?: ExternalToast, 
    user?: {name?: string, email?: string}
) => {
    return toast.error(message, {
        duration: 5000, 
        dismissible: true,
        ...data,
        classNames: {
            content: "flex-1"
        },
        action: 
            <Button 
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
                className="aspect-square w-fit h-fit p-2 flex-none"
            >
              <Megaphone size={18} />
            </Button>
    })
}