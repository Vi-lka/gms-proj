import { type ColumnDef } from "@tanstack/react-table";
import { Edit, Ellipsis, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { type DataTableRowAction } from "~/lib/types";
import { formatDate } from "~/lib/utils";
import { type LicensedAreaExtend } from "~/server/db/schema";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<LicensedAreaExtend> | null>
  >
}

export function getColumns({
  setRowAction,
}: GetColumnsProps): ColumnDef<LicensedAreaExtend>[] {
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
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      ),
      enableHiding: false,
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
                onSelect={() => setRowAction({ row, type: "update" })}
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