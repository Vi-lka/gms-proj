import { type ColumnDef } from "@tanstack/react-table";
import { Edit, Ellipsis, Trash2 } from "lucide-react";
import Image from "next/image";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { toast } from "sonner";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { type DataTableRowAction } from "~/lib/types";
import { type FieldMapExtend } from "~/server/db/schema";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<FieldMapExtend> | null>
  >,
  goToUpdate: (id: string) => void;
}

export function getColumns({
  setRowAction,
  goToUpdate,
}: GetColumnsProps): ColumnDef<FieldMapExtend>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <div className="max-w-fit pr-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-0.5"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 20
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => (
        <div
          onClick={()=> {
            void navigator.clipboard.writeText(row.getValue("id"))
            toast.success('ID скопирован')
          }}
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="w-36 truncate">
                {row.getValue("id")}
              </TooltipTrigger>
              <TooltipContent className="p-3">
                {row.getValue("id")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Название" />
      ),
      cell: ({ row }) => (
        <div
          onClick={()=> {
            void navigator.clipboard.writeText(row.getValue("name"))
            toast.success('Название скопировано')
          }}
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="max-w-64 truncate font-medium">
                {row.getValue("name")}
              </TooltipTrigger>
              <TooltipContent className="p-3">
                {row.getValue("name")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "fileUrl",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Карта" />
      ),
      cell: ({ row }) => (
        <div className="flex">
          <Dialog>
            <DialogTrigger>
              <Image 
                src={row.getValue("fileUrl")}
                alt={row.getValue("name")}
                width={100}
                height={100}
                className='hover:ring-1 ring-ring ring-offset-2 ring-offset-muted rounded-md object-cover aspect-video mx-auto transition-all duration-300'
              />
            </DialogTrigger>
            <DialogContent className="flex flex-col max-w-full h-full">
              <DialogHeader>
                <DialogTitle className="text-sm truncate">
                  {row.getValue("name")}
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
                        src={row.getValue("fileUrl")}
                        alt={row.getValue("name")}
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
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "fieldName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Месторождение" />
      ),
      cell: ({ row }) => (
        <div
          onClick={()=> {
            if (row.original.fieldId) {
              void navigator.clipboard.writeText(row.original.fieldId)
              toast.success('ID скопирован')
            }
          }}
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="max-w-[31.25rem] truncate font-medium">
                {row.getValue("fieldName")}
              </TooltipTrigger>
              <TooltipContent className="p-3">
                ID: {row.original.fieldId}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
    {
      accessorKey: "companyName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Компания" />
      ),
      cell: ({ row }) => (
        <div
          onClick={()=> {
            void navigator.clipboard.writeText(row.original.companyId)
            toast.success('ID скопирован')
          }}
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="max-w-[31.25rem] truncate font-medium">
                {row.getValue("companyName")}
              </TooltipTrigger>
              <TooltipContent className="p-3">
                ID: {row.original.companyId}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 p-0 data-[state=open]:bg-muted"
              >
                <Ellipsis className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => goToUpdate(row.original.id)}
              >
                Изменить
                <DropdownMenuShortcut>
                  <Edit size={16}/>
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "delete" })}
              >
                Удалить
                <DropdownMenuShortcut>
                  <Trash2 size={16}/>
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40,
    },
  ]
}