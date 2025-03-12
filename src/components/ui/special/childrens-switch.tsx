"use client"

import { Loader } from 'lucide-react'
import { useQueryStates } from 'nuqs'
import React from 'react'
import { IconByName, type Icons } from '~/components/icons'
import { Switch } from '~/components/ui/switch'
import { cn } from '~/lib/utils'
import { searchParamsTabs } from '~/lib/validations/search-params'

export default function ChildrensSwitch({
  firstIcon,
  secondIcon,
  childrenFirst,
  childrenSecond,
  className,
  classNameSwitch
}: {
  firstIcon: keyof typeof Icons,
  secondIcon: keyof typeof Icons,
  childrenFirst: React.ReactNode,
  childrenSecond: React.ReactNode,
  className?: string,
  classNameSwitch?: string
}) {
  const [{ view }, setChildren] = useQueryStates(searchParamsTabs, { shallow: false })

  const [isPending, startTransition] = React.useTransition()

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("flex items-center space-x-2 w-full justify-center mb-3", classNameSwitch)}>
        <IconByName name={firstIcon} className={cn(
          "w-5 h-5 text-muted-foreground transition-all", 
          (view === null || view === "first") && "text-foreground"
        )}/>
        <Switch 
          className='data-[state=unchecked]:bg-muted-foreground shadow-inner'
          classNameThumb='relative shadow'
          disabled={isPending}
          checked={view === "second"}
          onCheckedChange={(checked) => {
            startTransition(async () => {
              if (checked) await setChildren({ view:"second" })
              else await setChildren({ view: "first" })
            })
          }}
          loading={isPending && (
            <div className='absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-50'>
              <Loader size={14} className='animate-spin' />
            </div>
          )}
        />
        <IconByName name={secondIcon} className={cn(
          "w-5 h-5 text-muted-foreground transition-all", 
          (view === "second" && "text-foreground")
          )}/>
      </div>
      {view === "second" ? childrenSecond : childrenFirst}
    </div>
  )
}
