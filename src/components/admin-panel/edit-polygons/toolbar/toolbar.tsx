import React from 'react'
import ToolbarHistory from './toolbar-history';
import AddPolygon from '../add-polygon';
import { cn } from '~/lib/utils';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Button } from '~/components/ui/button';
import { X } from 'lucide-react';
import SaveButton from './save-button';
import ToolbarImage from './toolbar-image';

interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  showControls: boolean,
}

export default function Toolbar({
  showControls,
  className,
  ...props
}: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap sm:flex-nowrap w-full items-center justify-between gap-2 overflow-auto p-1",
        className
      )}
      {...props}
    >
      <div className='flex w-full items-center gap-2'>
        {showControls && <ToolbarImage />}
        {showControls && <ToolbarHistory />}
      </div>

      {showControls && <AddPolygon />}

      <SaveButton />
    </div>
  )
}
