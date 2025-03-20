import { type ColumnDef } from "@tanstack/react-table";
import { ArrowRight, Boxes, Building2, Database, Ellipsis, Folder, LandPlot, MapIcon, MapPin, Pickaxe, Triangle } from "lucide-react";
import { toast } from "sonner";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { type RecentItem } from "~/lib/types";
import { formatDate, idToSentenceCase } from "~/lib/utils";

interface GetColumnsProps {
  handleGoTo: (id: string, type: RecentItem["type"]) => void
}

export function getColumns({
  handleGoTo,
}: GetColumnsProps): ColumnDef<RecentItem>[] {
  return [
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
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Тип" />
      ),
      cell: ({ row }) => (
        <div className="max-w-[31.25rem] truncate text-xs flex items-center gap-1">
          <TypeIcon type={row.getValue("type")} /> {idToSentenceCase(row.getValue("type"))}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Название" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("title")}
          </span>
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "createUserName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Создано" />
      ),
      cell: ({ row }) => (
        <div
          onClick={()=> {
            if (row.original.createUserId) {
              void navigator.clipboard.writeText(row.original.createUserId)
              toast.success('ID скопирован')
            }
          }}
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="max-w-[31.25rem] truncate font-medium">
                {row.getValue("createUserName")}
              </TooltipTrigger>
              <TooltipContent className="p-3">
                ID: {row.original.createUserId}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
    {
      accessorKey: "updateUserName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Изменено" />
      ),
      cell: ({ row }) => (
        <div
          onClick={()=> {
            if (row.original.updateUserId) {
              void navigator.clipboard.writeText(row.original.updateUserId)
              toast.success('ID скопирован')
            }
          }}
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="max-w-[31.25rem] truncate font-medium">
                {row.getValue("updateUserName")}
              </TooltipTrigger>
              <TooltipContent className="p-3">
                ID: {row.original.updateUserId}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Создано в" />
      ),
      cell: ({ row }) => {
        const date = 
          row.getValue("createdAt")
            ? formatDate(row.getValue("createdAt"), { month: "numeric", hour: "numeric", minute: "numeric" })
            : null;
        return (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {date}
          </span>
        </div>
      )},
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Изменено в" />
      ),
      cell: ({ row }) => {
        const date = 
          row.getValue("updatedAt")
            ? formatDate(row.getValue("updatedAt"), { month: "numeric", hour: "numeric", minute: "numeric" })
            : null;
        return (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {date}
          </span>
        </div>
      )},
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
                <Ellipsis className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onSelect={() => handleGoTo(row.original.id, row.original.type)}
              >
                Перейти
                <DropdownMenuShortcut>
                  <ArrowRight size={16}/>
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

function TypeIcon({ type }: { type: RecentItem["type"] }) {
  switch (type) {
    case "mapItem":
      return <MapIcon className="size-4 flex-none" />;
    case "fieldMap":
      return <MapPin className="size-4 flex-none" />;
    case "polygon":
      return <Triangle className="size-4 flex-none" />;
    case "cluster":
      return <Boxes className="size-4 flex-none" />;
    case "company":
      return <Building2 className="size-4 flex-none" />;
    case "field":
      return <Pickaxe className="size-4 flex-none" />;
    case "licensedArea":
      return <LandPlot className="size-4 flex-none" />;
    case "areaData":
      return <Database className="size-4 flex-none" />;
    case "file":
      return <Folder className="size-4 flex-none" />;
    default:
      return null;
  }
}