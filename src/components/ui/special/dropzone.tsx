import { MousePointerClick, UploadCloud, XIcon } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone, type Accept } from "react-dropzone";
import Image from 'next/image';
import { cn } from '~/lib/utils';
import Link from 'next/link';
import { Button } from '../button';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { PopoverClose } from '@radix-ui/react-popover';
import { MAX_FILE_SIZE } from '~/lib/static/max-file-size';

type DropzoneCommonProps = {
  accept: Accept;
  maxSize: number;
  isImage: boolean,
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode,
  handleDrop: (acceptedFiles: File[]) => void
}

type DropzoneWithFileProps = {
  defaultValue: { file?: File | null; url: string | undefined };
  fileId?: number;
  originalName?: string;
  handleDelete: () => void
}
type DropzoneWithoutFileProps = {
  defaultValue?: never;
  fileId?: never;
  originalName?: never;
  handleDelete?: () => void
}
type DropzoneProps = DropzoneCommonProps & (DropzoneWithFileProps | DropzoneWithoutFileProps);

export default function Dropzone({
  accept,
  maxSize = MAX_FILE_SIZE,
  defaultValue,
  isImage,
  disabled,
  fileId,
  originalName,
  className,
  children,
  handleDrop,
  handleDelete
}: DropzoneProps) {
  const [fileName, setFileName] = useState<string>();
  const [valueURL, setURL] = useState<string>();
  const [popoverOpen, setPopoverOpen] = useState(false)

  useEffect(() => {
    if (defaultValue?.url) setURL(defaultValue.url);

    if (!!defaultValue?.file && !defaultValue?.url) {
      const fileUrl = URL.createObjectURL(defaultValue.file);
      setURL(fileUrl);
    }
  }, [defaultValue?.file, defaultValue?.url]);

  useEffect(() => {
    if (originalName) setFileName(originalName)
  }, [originalName])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0 || acceptedFiles[0] === undefined) return;
      const newFileUrl = URL.createObjectURL(acceptedFiles[0]);
      setURL(newFileUrl);
      setFileName(acceptedFiles[0].name);
      handleDrop(acceptedFiles)
    },
    [handleDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled,
  });

  const onDelete = () => {
    if (fileId && handleDelete) {
      handleDelete();
      setURL(undefined);
      setFileName(undefined);
      setPopoverOpen(false);
    } else {
      setURL(undefined);
      setFileName(undefined);
      setPopoverOpen(false);
    }
  };

  if (!valueURL || valueURL.length === 0) return (
    <div
      {...getRootProps({
        className: cn(
          "flex flex-col justify-center items-center p-12 border border-solid border-border rounded-md cursor-pointer bg-muted",
          className
        ),
      })}
    >
      <input {...getInputProps()} />
      <UploadCloud className="text-muted-foreground mx-auto w-8 h-8" />
      {isDragActive ? (
        <p className="text-muted-foreground text-center text-xs">
          Скиньте файл сюда ...
        </p>
      ) : (
        <p className="text-muted-foreground text-center text-xs">
          <span className="underline-offset-3 underline">Drag & drop</span> или{" "}
          <span className="underline underline-offset-2">
            <MousePointerClick className="inline h-3 w-3" />
            Click
          </span>
        </p>
      )}
      {children}
    </div>
  )

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <span
            className="text-muted-foreground hover:text-foreground mx-auto my-1 flex w-fit cursor-pointer items-center justify-center text-xs transition-all hover:scale-110"
          >
            <XIcon className="h-5 w-5" /> Удалить
          </span>
        </PopoverTrigger>
        <PopoverContent>
          <p className="text-center mb-1 text-sm">
            Вы уверены?
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="destructive"
              onClick={onDelete}
            >
              Удалить
            </Button>
            <PopoverClose asChild>
              <Button variant="secondary">
                Отмена
              </Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
      <div
        {...getRootProps({
          className: cn(
            "flex flex-col justify-center items-center  lg:px-12 px-0 lg:py-10 py-2 border border-solid border-border rounded-md cursor-pointer bg-muted",
            className
          ),
        })}
      >
        <input {...getInputProps()} />
        {isImage
          ? (<>
              <Image
                src={valueURL}
                width={180}
                height={180}
                alt={!!fileName ? fileName : valueURL}
                className="mx-auto object-cover"
              />
              <p className="mt-3 w-full break-words text-center text-xs font-light">
                {!!fileName ? fileName : valueURL}
              </p>
              {children}
          </>)
          : (
            <>
              <p className="mt-3 w-full break-words text-center text-xs font-medium">
                {!!fileName ? fileName : valueURL}
              </p>
              {children}
            </>
          )
        }
      </div>
      <Link href={valueURL} className="w-fit h-fit" passHref target="_blank">
        <Button variant="link" type="button" className="w-full">
          Открыть файл
        </Button>
      </Link>
    </>
  )
}
