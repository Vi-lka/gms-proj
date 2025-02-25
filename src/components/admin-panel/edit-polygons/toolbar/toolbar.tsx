import React from 'react'
import ToolbarHistory from './toolbar-history';
import AddPolygon from '../add-polygon';
import { cn } from '~/lib/utils';
import ToolbarImage from './toolbar-image';

interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  showControls: boolean,
}

export default function Toolbar({
  showControls,
  className,
  children,
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

      {children}
    </div>
  )
}
