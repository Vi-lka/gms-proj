import { type ColumnDef } from "@tanstack/react-table";
import { Edit, Ellipsis } from "lucide-react";
import { toast } from "sonner";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { type DataTableRowAction } from "~/lib/types";
import { formatDate } from "~/lib/utils";
import { type Profitability } from "~/server/db/schema";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<Profitability> | null>
  >
}

export function getColumns({
  setRowAction,
}: GetColumnsProps): ColumnDef<Profitability>[] {
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
      accessorKey: "lithium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Li+"
          titleNode={<span>Li<sup>+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("lithium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "rubidium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Rb+"
          titleNode={<span>Rb<sup>+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("rubidium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "cesium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Cs+"
          titleNode={<span>Cs<sup>+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("cesium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "boron",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="B"
          titleNode={<span>B</span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("boron")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "iodine",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="I-"
          titleNode={<span>I<sup>-</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("iodine")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "sodium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Na+"
          titleNode={<span>Na<sup>+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("sodium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "calcium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Ca2+"
          titleNode={<span>Ca<sup>2+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("calcium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "magnesium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Mg2+"
          titleNode={<span>Mg<sup>2+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("magnesium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "potassium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="K+"
          titleNode={<span>K<sup>+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("potassium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "chlorine",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Cl-"
          titleNode={<span>Cl<sup>-</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("chlorine")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "bromine",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Br-"
          titleNode={<span>Br<sup>-</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("bromine")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "strontium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Sr2+"
          titleNode={<span>Sr<sup>2+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("strontium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "barium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Ba2+"
          titleNode={<span>Ba<sup>2+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("barium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "aluminum",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Al3+"
          titleNode={<span>Al<sup>3+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("aluminum")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "selenium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Se2+"
          titleNode={<span>Se<sup>2+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("selenium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "silicon",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Si"
          titleNode={<span>Si</span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("silicon")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "manganese",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Mn2+"
          titleNode={<span>Mn<sup>2+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("manganese")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "copper",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Сu2+"
          titleNode={<span>Сu<sup>2+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("copper")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "zinc",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Zn2+"
          titleNode={<span>Zn<sup>2+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("zinc")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "silver",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Ag"
          titleNode={<span>Ag</span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("silver")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "tungsten",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="W"
          titleNode={<span>W</span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("tungsten")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "titanium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Ti"
          titleNode={<span>Ti</span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("titanium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "vanadium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="V"
          titleNode={<span>V</span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("vanadium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "chromium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Cr"
          titleNode={<span>Cr</span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("chromium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "cobalt",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Co"
          titleNode={<span>Co</span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("cobalt")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "nickel",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Ni"
          titleNode={<span>Ni</span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("nickel")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "arsenic",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="As"
          titleNode={<span>As</span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("arsenic")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "molybdenum",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Mo"
          titleNode={<span>Mo</span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("molybdenum")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "plumbum",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Pb"
          titleNode={<span>Pb</span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("plumbum")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "bismuth",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Bi"
          titleNode={<span>Bi</span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("bismuth")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "sulfateIon",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="SO42-"
          titleNode={<span>SO<sub>4</sub><sup>2-</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("sulfateIon")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "bicarbonate",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="HCO3-"
          titleNode={<span>HCO<sub>3</sub><sup>-</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("bicarbonate")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "carbonateIon",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="CO32-"
          titleNode={<span>CO<sub>3</sub><sup>-2</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("carbonateIon")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "ammonium",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="NH4+"
          titleNode={<span>NH<sub>4</sub><sup>+</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("ammonium")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "fluorine",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="F-"
          titleNode={<span>F<sup>-</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("fluorine")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "nitrogenDioxide",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="NO2-"
          titleNode={<span>NO<sub>2</sub><sup>-</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("nitrogenDioxide")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "nitrate",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="NO3-"
          titleNode={<span>NO<sub>3</sub><sup>-</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("nitrate")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "phosphate",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="PO43-"
          titleNode={<span>PO<sub>4</sub><sup>3-</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("phosphate")}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "ferrum",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Fe(общ)"
          titleNode={<span>Fe<sup>(общ)</sup></span>}
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("ferrum")}
          </span>
        </div>
      ),
      enableSorting: false,
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
      ),
      enableSorting: false,
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
      ),
      enableSorting: false,
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
      enableSorting: false,
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
      enableSorting: false,
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
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "update" })}
              >
                Изменить
                <DropdownMenuShortcut>
                  <Edit size={16}/>
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              {/* <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setRowAction({ row, type: "delete" })}
              >
                Удалить
                <DropdownMenuShortcut>
                  <Trash2 size={16}/>
                </DropdownMenuShortcut>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      size: 40,
    },
  ]
}