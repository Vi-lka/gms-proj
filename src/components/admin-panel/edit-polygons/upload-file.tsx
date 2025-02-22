import React from 'react'
import { usePolyStore } from '~/components/poly-annotation/store/poly-store-provider'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import Dropzone from '~/components/ui/special/dropzone'
import { env } from '~/env'

export default function UploadFile() {
  const imageFile = usePolyStore((state) => state.imageFile)
  const setImageFile = usePolyStore((state) => state.setImageFile)
  const setImageUrl = usePolyStore((state) => state.setImageUrl)

  if (env.NEXT_PUBLIC_IS_VERCEL === "true") return (
    <Card>
      <CardHeader>
        <CardTitle>Загрузите фото</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Тестовый сервер. Загрузка файлов невозможна, будет загружено тестовое фото</p>
      </CardContent>
      <CardFooter className='flex justify-center'>
        <Button onClick={() => setImageUrl('/images/test.svg')}>
          Загрузить
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Загрузите фото</CardTitle>
        <CardDescription>
          <p>Допустимые форматы: JPEG, JPG, PNG, SVG</p>
          <p>Максимальный размер: 20Mb</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dropzone
          isImage
          accept={{
            'image/jpg': [],
            'image/jpeg': [],
            'image/png': [],
          }}
          maxSize={20 * 1024 * 1024} // 20Mb
          handleDrop={(acceptedFiles) => {
            if (acceptedFiles.length > 0 && !!acceptedFiles[0]) {
              setImageFile(acceptedFiles[0])
            };
          }}
          handleDelete={() => {
            setImageFile(null)
            setImageUrl(undefined)
          }}
          className="min-h-32 bg-background rounded-lg border-dashed border border-primary/50 shadow hover:bg-secondary transition-all outline outline-1 outline-border outline-offset-2"
        >
          <p className="text-xs text-muted-foreground mt-2 text-center">
            JPEG, JPG, PNG, SVG (Max 20Mb)
          </p>
        </Dropzone>
      </CardContent>
      <CardFooter className='flex justify-center'>
        <Button 
          disabled={!imageFile}
          onClick={() => {
            if (imageFile) setImageUrl(URL.createObjectURL(imageFile))
          }}
        >
          Сохранить
        </Button>
      </CardFooter>
    </Card>
  )
}
