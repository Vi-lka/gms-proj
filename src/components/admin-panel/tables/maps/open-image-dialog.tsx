import { type Row } from "@tanstack/react-table";
import Image from "next/image";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { Button } from "~/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { type MapDataExtend } from "~/server/db/schema";

interface OpenImageDialogProps extends React.ComponentPropsWithoutRef<typeof Dialog> {
  row:  Row<MapDataExtend> | undefined,
  showTrigger?: boolean
}

export default function OpenImageDialog({
  row,
  showTrigger = true, 
  ...props
}: OpenImageDialogProps) {

  if (!row) return null;

  return (
    <Dialog {...props}>
      {showTrigger ? (
        <DialogTrigger>
          <Image 
            src={row.getValue("svgUrl")}
            alt={row.original.fileId}
            width={100}
            height={100}
            className='hover:ring-1 ring-ring ring-offset-2 ring-offset-muted rounded-md object-cover aspect-video mx-auto transition-all duration-300'
          />
        </DialogTrigger>
      ) : null}
      <DialogContent className="flex flex-col max-w-full h-full">
        <DialogHeader>
          <DialogTitle className="text-sm truncate">
            Карта России
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1">
          <TransformWrapper 
            wheel={{
              smoothStep: 0.0007
            }}
            maxScale={3}
          >
            <TransformComponent
              wrapperClass='bg-accent rounded-xl'
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "0 auto",
              }}
            >
              <div className="relative h-full w-full">
                <Image
                  src={row.getValue("svgUrl")}
                  alt={row.original.fileId}
                  fill
                  sizes='200vw'
                  quality={100}
                  className="object-contain"
                />
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Закрыть</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
