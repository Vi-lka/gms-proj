"use client"

import React from 'react'
import { Button, type ButtonProps } from '../button';
import { cn, downloadExcel } from '~/lib/utils';
import { Loader } from 'lucide-react';

export interface DownloadTableButtonProps extends ButtonProps {
  data: Record<string, {name: string, data: unknown[]}>,
  fileName?: string
}

export default function DownloadTableButton({
  data, 
  fileName = "Данные ГМС",
  className,
  onClick,
  disabled,
  children,
  ...props
}: DownloadTableButtonProps) {
  const [isPending, startTransition] = React.useTransition()

  return (
    <Button 
      {...props}
      className={cn("", className)}
      disabled={disabled ?? isPending}
      onClick={(e) => {
        startTransition(() => downloadExcel(data, fileName))
        onClick?.(e)
      }}
    >
      {isPending && <Loader className="flex-none mr-2 size-4 animate-spin" />}
      {children ?? "Скачать"}
    </Button>
  )
}
