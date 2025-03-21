import { type Row, type ColumnDef } from "@tanstack/react-table";
import { Check, Ellipsis } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { type DataTableRowAction } from "~/lib/types";
import { type FileDBWithUrl } from "~/server/db/schema";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<FileDBWithUrl> | null>
  >,
  onSelect: (row: Row<FileDBWithUrl>) => void
}

export function getColumns({
  setRowAction,
  onSelect
}: GetColumnsProps): ColumnDef<FileDBWithUrl>[] {
  return [
    {
      accessorKey: "fileUrl",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Фото" className="min-w-60 text-center" />
      ),
      cell: ({ row }) => (
        <div className="flex">
          <Image 
            src={row.getValue("fileUrl")}
            alt={row.original.originalName}
            width={240}
            height={240}
            className='hover:ring-1 ring-ring ring-offset-2 ring-offset-muted rounded-md object-cover aspect-video mx-auto cursor-pointer transition-all duration-300'
            onClick={() => setRowAction({ row, type: "dialog" })}
          />
        </div>
      ),
      enableHiding: false,
      enableSorting: false,
    },
    {
      accessorKey: "originalName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Название" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("originalName")}
          </span>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "fileName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Название в Minio" />
      ),
      cell: ({ row }) => (
        <div
          onClick={()=> {
            void navigator.clipboard.writeText(row.getValue("fileName"))
            toast.success('Название скопировано')
          }}
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="w-36 truncate">
                {row.getValue("fileName")}
              </TooltipTrigger>
              <TooltipContent className="p-3">
                {row.getValue("fileName")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
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
                <Ellipsis className="size-4"/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => onSelect(row)}
              >
                Выбрать
                <DropdownMenuShortcut>
                  <Check size={16}/>
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