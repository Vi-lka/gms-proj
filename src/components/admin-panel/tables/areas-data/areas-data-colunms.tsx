import { type DataTableRowAction } from "~/lib/types";
import { type AreaDataExtend } from "../../../../server/db/schema/fields";
import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Edit, Ellipsis, Trash2 } from "lucide-react";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import Link from "next/link";
import { formatApproxNumber, formatDate } from "~/lib/utils";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<AreaDataExtend> | null>
  >
}

export function getColumns({
  setRowAction,
}: GetColumnsProps): ColumnDef<AreaDataExtend>[] {
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
      accessorKey: "areaName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Лицензионный участок" />
      ),
      cell: ({ row }) => (
        <div
          onClick={()=> {
            void navigator.clipboard.writeText(row.original.areaId)
            toast.success('ID скопирован')
          }}
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="max-w-[31.25rem] truncate font-medium">
                {row.getValue("areaName")}
              </TooltipTrigger>
              <TooltipContent className="p-3">
                ID: {row.original.areaId}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
            void navigator.clipboard.writeText(row.original.fieldId)
            toast.success('ID скопирован')
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
      accessorKey: "bush",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Куст" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("bush")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "hole",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Скважина" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("hole")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "plast",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Пласт" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("plast")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "horizon",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Горизонт" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("horizon")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "retinue",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Свита" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("retinue")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "occurrenceInterval",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Интервал залегания (м)" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("occurrenceInterval")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "samplingDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Дата отбора пробы" />
      ),
      cell: ({ row }) => {
        const date = 
          row.getValue("samplingDate")
            ? formatDate(row.getValue("samplingDate"))
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
      accessorKey: "analysisDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Дата анализа" />
      ),
      cell: ({ row }) => {
        const date = 
          row.getValue("analysisDate")
            ? formatDate(row.getValue("analysisDate"))
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
      accessorKey: "protocol",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="№ протокола (лаборатория)" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("protocol")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "protocolUrl",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ссылка на протокол" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          {row.getValue("protocolUrl")
            ? (
              <Link href={row.getValue("protocolUrl")} target="__blank" passHref>
                <span className="block max-w-52 truncate font-medium hover:underline">
                  {row.getValue("protocolUrl")}
                </span>
              </Link>
            )
            : (
              <span className="max-w-12 truncate font-medium">
                {row.getValue("protocolUrl")}
              </span>
            )
          }
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "sampleCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Шифр пробы (лаборатория)" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("sampleCode")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "pHydrogen",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="pH" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("pHydrogen")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "density",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="р (кг/м³)" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("density")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "mineralization",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Минерализация (мг/дм³)" />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("mineralization")}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("lithium"), row.original.lithiumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("rubidium"), row.original.rubidiumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("cesium"), row.original.cesiumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("boron"), row.original.boronApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("iodine"), row.original.iodineApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("sodium"), row.original.sodiumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("calcium"), row.original.calciumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("magnesium"), row.original.magnesiumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("potassium"), row.original.potassiumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("chlorine"), row.original.chlorineApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("bromine"), row.original.bromineApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("strontium"), row.original.strontiumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("barium"), row.original.bariumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("aluminum"), row.original.aluminumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("selenium"), row.original.seleniumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("silicon"), row.original.siliconApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("manganese"), row.original.manganeseApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("copper"), row.original.copperApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("zinc"), row.original.zincApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("silver"), row.original.silverApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("tungsten"), row.original.tungstenApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("titanium"), row.original.titaniumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("vanadium"), row.original.vanadiumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("chromium"), row.original.chromiumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("cobalt"), row.original.cobaltApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("nickel"), row.original.nickelApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("arsenic"), row.original.arsenicApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("molybdenum"), row.original.molybdenumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("plumbum"), row.original.plumbumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("bismuth"), row.original.bismuthApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("sulfateIon"), row.original.sulfateIonApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("bicarbonate"), row.original.bicarbonateApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("carbonateIon"), row.original.carbonateIonApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("ammonium"), row.original.ammoniumApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("fluorine"), row.original.fluorineApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("nitrogenDioxide"), row.original.nitrogenDioxideApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("nitrate"), row.original.nitrateApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("phosphate"), row.original.phosphateApprox)}
          </span>
        </div>
      ),
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
            {formatApproxNumber(row.getValue("ferrum"), row.original.ferrumApprox)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "rigidity",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Жесткость, ºЖ"
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("rigidity")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "alkalinity",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Общая щелочность, ммоль/дм³"
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("alkalinity")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "electricalConductivity",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Удельная электропроводимость, мСм/см"
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("electricalConductivity")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "suspendedSolids",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Взвешенные вещества, мг/дм³"
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("suspendedSolids")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "dryResidue",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Сухой остаток"
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("dryResidue")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "analysisPlace",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Место анализа"
        />
      ),
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <span className="max-w-[31.25rem] truncate font-medium">
            {row.getValue("analysisPlace")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "note",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Примечание"
        />
      ),
      cell: ({ row }) => (
        <div
          onClick={()=> {
            if (row.original.note) {
              void navigator.clipboard.writeText(row.original.note)
              toast.success('ID скопирован')
            }
          }}
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="max-w-[31.25rem] truncate font-medium">
                {row.getValue("note")}
              </TooltipTrigger>
              <TooltipContent className="p-3 xl:max-w-screen-lg lg:max-w-screen-md md:max-w-screen-sm max-w-xs">
                {row.original.note}
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
                <Ellipsis className="size-4" aria-hidden="true" />
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