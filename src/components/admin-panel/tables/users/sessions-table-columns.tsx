import { type ColumnDef } from "@tanstack/react-table";
import React from "react";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import type { DataTableRowAction } from "~/lib/types";
import { toast } from "sonner"
import { formatDate, idToSentenceCase } from "~/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Ellipsis, Trash2 } from "lucide-react";
import { type SessionExtend } from "~/server/db/schema";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<SessionExtend> | null>
  >
}

export function getColumns({
  setRowAction,
}: GetColumnsProps): ColumnDef<SessionExtend>[] {
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
      accessorKey: "userId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User ID" />
      ),
      cell: ({ row }) => (
        <div
          onClick={()=> {
            void navigator.clipboard.writeText(row.getValue("userId"))
            toast.success('ID скопирован')
          }}
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="w-36 truncate">
                {row.getValue("userId")}
              </TooltipTrigger>
              <TooltipContent className="p-3">
                {row.getValue("userId")}
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
      )
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("email")}
          </span>
        </div>
      )
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Роль" />
      ),
      cell: ({ row }) => (
        <div className="flex w-36 items-center">
          <Badge variant="outline" className="capitalize">{idToSentenceCase(row.getValue("role"))}</Badge>
        </div>
      ),
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "expires",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Истекает" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue() as Date),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open menu"
              variant="ghost"
              className="flex size-8 p-0 data-[state=open]:bg-muted"
            >
              <Ellipsis className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
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
      ),
      size: 40,
    },
  ]
}
