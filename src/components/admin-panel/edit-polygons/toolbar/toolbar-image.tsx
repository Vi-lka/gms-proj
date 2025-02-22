import React from 'react'
import { usePolyStore, useTemporalStore } from '~/components/poly-annotation/store/poly-store-provider'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import Image from 'next/image'
import { Button } from '~/components/ui/button'
import { XIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import { defaultInitState } from '~/components/poly-annotation/store'

export default function ToolbarImage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {stageConfig, imageConfig, stageRef, ...restDefaultInitState} = defaultInitState

  const imageUrl = usePolyStore((state) => state.imageUrl)
  const isAddible = usePolyStore((state) => state.isAddible)
  const editPolygonIndex = usePolyStore((state) => state.editPolygonIndex)
  const setImageUrl = usePolyStore((state) => state.setImageUrl)
  const setGlobalState = usePolyStore((state) => state.setGlobalState)
  
  const { clear } = useTemporalStore((state) => state)

  if (!imageUrl) return null;

  const disabled = isAddible || editPolygonIndex !== null

  return (
    <Popover>
      <PopoverTrigger disabled={disabled}>
        <Image 
          src={imageUrl}
          alt={'Image'}
          width={36}
          height={36}
          className={cn(
            'object-cover flex-none aspect-square h-full max-h-9 cursor-pointer overflow-hidden rounded-md ring-ring ring-offset-2 ring-offset-muted transition-all',
            !disabled && 'hover:ring-1'
          )}
        />
      </PopoverTrigger>
      <PopoverContent side='top' className='w-fit h-fit flex p-1'>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={() => {
            setImageUrl(undefined)
            setGlobalState((prev) => ({
              ...prev,
              ...restDefaultInitState
            }))
            clear()
          }}
          disabled={disabled}
          className='gap-1 py-1 px-2 h-fit'
        >
          <XIcon size={14} className='flex-none' /> Удалить
        </Button>
      </PopoverContent>
    </Popover>
  )
}
