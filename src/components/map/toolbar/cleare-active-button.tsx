"use client"

import React from 'react'
import { useQueryState } from 'nuqs'
import { Button } from '~/components/ui/button';
import { XIcon } from 'lucide-react';

export default function CleareActiveButton() {
  const [activeId, setActiveId] = useQueryState("activeId", { defaultValue: "" });

  if ((activeId === "" || activeId === null)) return null;

  return (
    <Button
      variant="ghost"
      className='gap-1'
      onClick={() => setActiveId(null)}
    >
      <XIcon className="size-5 flex-none" /> Очистить выделение
    </Button>
  )
}
