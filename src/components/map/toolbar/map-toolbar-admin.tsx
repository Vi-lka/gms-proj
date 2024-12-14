import React from 'react'
import { cn } from '~/lib/utils'
import AddEllementButton from './add-ellement/add-ellement-button'


// interface MapAdminToolbarProps
  // extends React.HTMLAttributes<HTMLDivElement> {
// }

type MapAdminToolbarProps = React.HTMLAttributes<HTMLDivElement>

export default function MapToolbarAdmin({
  className,
  ...props
}: MapAdminToolbarProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2 overflow-auto p-1",
        className
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-2">
        <AddEllementButton />
      </div>
    </div>
  )
}
