import { type ColumnDef } from "@tanstack/react-table";
import { Ellipsis } from "lucide-react";
import React from "react";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { type DataTableRowAction } from "~/lib/types";
import { users, type User } from "~/server/db/schema";
import { toast } from "sonner"
import { getErrorMessage } from "~/lib/handle-error";
import { updateUser } from "~/server/actions/updateUser";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { idToSentenceCase } from "~/lib/utils";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<User> | null>
  >
}

export function getColumns({
  // setRowAction,
}: GetColumnsProps): ColumnDef<User>[] {
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
        <DataTableColumnHeader column={column} title="Имя" />
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
      id: "actions",
      cell: function Cell({ row }) {
        const [isUpdatePending, startUpdateTransition] = React.useTransition()

        return (
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
              {/* <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "update" })}
              >
                Edit
              </DropdownMenuItem> */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Роль</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={row.original.role}
                    onValueChange={(value) => {
                      startUpdateTransition(() => {
                        toast.promise(
                          updateUser({
                            id: row.original.id,
                            role: value as User["role"],
                          }),
                          {
                            loading: "Обновляем...",
                            success: "Роль обновлена",
                            error: (err) => getErrorMessage(err),
                          }
                        )
                      })
                    }}
                  >
                    {users.role.enumValues.map((role) => (
                      <DropdownMenuRadioItem
                        key={role}
                        value={role}
                        className="capitalize"
                        disabled={isUpdatePending}
                      >
                        {idToSentenceCase(role)}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40,
    },
  ]
}
