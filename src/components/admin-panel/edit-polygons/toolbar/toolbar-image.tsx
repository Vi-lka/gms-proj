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
  const {stageConfig, imageConfig, stageRef, fieldId, polygons, ...restDefaultInitState} = defaultInitState

  const imageUrl = usePolyStore((state) => state.imageUrl)
  const isAddible = usePolyStore((state) => state.isAddible)
  const editPolygonIndex = usePolyStore((state) => state.editPolygonIndex)
  const setImageUrl = usePolyStore((state) => state.setImageUrl)
  const setImageFile = usePolyStore((state) => state.setImageFile)
  const setSelectedImage = usePolyStore((state) => state.setSelectedImage)
  const setGlobalState = usePolyStore((state) => state.setGlobalState)
  
  const { clear } = useTemporalStore((state) => state)

  const handleDelete = () => {
    setImageUrl(undefined)
    setImageFile(null)
    setSelectedImage(null)
    setGlobalState((prev) => ({
      ...prev,
      ...restDefaultInitState
    }))
    clear()
  }

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
            'object-cover aspect-square h-full max-h-9 overflow-hidden rounded-md ring-ring ring-offset-2 ring-offset-muted transition-all opacity-50',
            !disabled && 'hover:ring-1 cursor-pointer opacity-100'
          )}
        />
      </PopoverTrigger>
      <PopoverContent side='top' className='w-fit h-fit flex flex-col gap-2 p-1'>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleDelete}
          disabled={disabled}
          className='gap-1 py-1 px-2 h-fit'
        >
          <XIcon size={14} className='flex-none' /> Удалить
        </Button>
      </PopoverContent>
    </Popover>
  )
}
