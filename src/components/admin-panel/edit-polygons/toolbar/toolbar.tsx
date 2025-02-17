import React from 'react'
import ToolbarHistory from './toolbar-history';
import AddPolygon from '../add-polygon';
import { cn } from '~/lib/utils';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Button } from '~/components/ui/button';
import { Save, X } from 'lucide-react';
import SaveButton from './save-button';

interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  showControls: boolean,
  imageUrl: string | undefined,
  setImageUrl: React.Dispatch<React.SetStateAction<string | undefined>>
}

export default function Toolbar({
  imageUrl,
  setImageUrl,
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
        {imageUrl && (
          <Popover>
            <PopoverTrigger asChild>
              <Image 
                src={imageUrl}
                alt={'Image'}
                width={36}
                height={36}
                className='flex-none aspect-square h-full max-h-9 cursor-pointer overflow-hidden rounded-md hover:ring-1 ring-ring ring-offset-2 ring-offset-muted transition-all'
              />
            </PopoverTrigger>
            <PopoverContent side='top' className='w-fit h-fit flex p-1'>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setImageUrl(undefined)}
                className='gap-1 py-1 px-2 h-fit'
              >
                <X size={14} className='flex-none' /> Удалить
              </Button>
            </PopoverContent>
          </Popover>
        )}
        {showControls && <ToolbarHistory />}
      </div>

      {showControls && <AddPolygon />}

      <SaveButton />
    </div>
  )
}
