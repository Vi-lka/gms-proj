import React from 'react'
import { env } from '~/env'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card'
import { Button } from '../button'
import Dropzone from './dropzone'
import { Loader } from 'lucide-react'
import { type Accept } from 'react-dropzone'
import { formatBytes, getAcceptText } from '~/lib/utils'

type UploadFileCardProps = {
  imageFile: File | null,
  setImageFile: (file: File | null) => void,
  setImageUrl?: (url: string | undefined) => void,
  handleSave?: () => void,
  disabled?: boolean,
  isPending?: boolean,
  canUploadTest?: boolean,
  accept?: Accept,
  maxSize?: number
}

export default function UploadFileCard({
  imageFile,
  setImageUrl,
  setImageFile,
  handleSave,
  disabled,
  isPending,
  canUploadTest = false,
  accept = {
    'image/jpg': [],
    'image/jpeg': [],
    'image/png': [],
    'image/svg+xml': [],
  },
  maxSize = 20 * 1024 * 1024 // 20Mb
}: UploadFileCardProps) {
  if (env.NEXT_PUBLIC_IS_VERCEL === "true") return (
    <Card>
      <CardHeader>
        <CardTitle>Загрузите фото</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Тестовый сервер. Загрузка файлов невозможна{canUploadTest && ', будет загружено тестовое фото'}</p>
      </CardContent>
      <CardFooter className='flex justify-center'>
        {canUploadTest && <Button onClick={() => setImageUrl?.('/images/test.svg')}>Загрузить</Button>}
      </CardFooter>
    </Card>
  )

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Загрузите фото</CardTitle>
        <CardDescription>
          <p>Допустимые форматы: {getAcceptText(accept)}</p>
          <p>Максимальный размер: {formatBytes(maxSize)}</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dropzone
          isImage
          disabled={!!disabled || !!isPending}
          accept={accept}
          maxSize={maxSize}
          handleDrop={(acceptedFiles) => {
            if (acceptedFiles.length > 0 && !!acceptedFiles[0]) {
              setImageFile(acceptedFiles[0])
            };
          }}
          handleDelete={() => {
            setImageFile(null)
            setImageUrl?.(undefined)
          }}
          className="min-h-32 bg-background rounded-lg border-dashed border border-primary/50 shadow hover:bg-secondary transition-all outline outline-1 outline-border outline-offset-2"
        >
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {getAcceptText(accept)} (Max {formatBytes(maxSize)})
          </p>
        </Dropzone>
      </CardContent>
      <CardFooter className='flex justify-center'>
        <Button 
          disabled={!imageFile || !!disabled || !!isPending}
          onClick={() => {
            if (handleSave) handleSave()
            if (imageFile) setImageUrl?.(URL.createObjectURL(imageFile))
          }}
        >
          {isPending && <Loader className="flex-none mr-2 size-4 animate-spin" />}
          Сохранить
        </Button>
      </CardFooter>
    </Card>
  )
}
