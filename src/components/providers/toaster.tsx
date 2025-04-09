"use client"

import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { Toaster as Sonner, toast, useSonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme()
  const { toasts } = useSonner();

  const pathName = usePathname()

  useEffect(() => {
    // Dismiss all active toasts on path change
    toasts.forEach((t) => toast.dismiss(t.id));
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [pathName])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:!bg-background group-[.toaster]:!text-foreground group-[.toaster]:!border-border group-[.toaster]:!shadow-lg",
          error: "group-[.toaster]:!bg-destructive group-[.toaster]:!text-destructive-foreground",
          description: "group-[.toast]:!text-muted-foreground",
          actionButton:
            "group-[.toast]:!bg-foreground group-[.toast]:!text-background group-[.toast]:!py-4",
          cancelButton:
            "group-[.toast]:!bg-destructive group-[.toast]:!text-destructive-foreground group-[.toast]:!py-4",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
