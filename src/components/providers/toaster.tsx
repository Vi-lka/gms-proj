"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:!bg-background group-[.toaster]:!text-foreground group-[.toaster]:!border-border group-[.toaster]:!shadow-lg",
          description: "group-[.toast]:!text-muted-foreground",
          actionButton:
            "group-[.toast]:!bg-primary group-[.toast]:!text-primary-foreground group-[.toast]:!py-4",
          cancelButton:
            "group-[.toast]:!bg-destructive group-[.toast]:!text-destructive-foreground group-[.toast]:!py-4",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
