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
import { formatDate, idToSentenceCase } from "~/lib/utils";
import FixedFloatCell from "~/components/data-table/fixed-float-cell";
import { ELEMENTS } from "~/lib/static/elements";
import { ELEMENTS_TITLE } from "~/lib/static/elements-title";

interface GetColumnsProps {
  setRowAction: React.Dispatch<
    React.SetStateAction<DataTableRowAction<AreaDataExtend> | null>
  >
}

export function getColumns({
  setRowAction,
}: GetColumnsProps): ColumnDef<AreaDataExtend>[] {

  const elementsColumns: ColumnDef<AreaDataExtend>[] = Object.keys(ELEMENTS).map(element => {
    const elementKey = element as keyof typeof ELEMENTS
    return ({
      accessorKey: elementKey,
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title={idToSentenceCase(elementKey)}
          titleNode={ELEMENTS_TITLE[elementKey]}
        />
      ),
      cell: ({ row }) => (
        <FixedFloatCell 
          value={row.getValue(elementKey)} 
          original={row.original[elementKey]} 
          approxValue={row.original[`${elementKey}Approx`]}
        />
      ),
    })
  })

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
      cell: ({ row }) => <FixedFloatCell value={row.getValue("pHydrogen")} original={row.original.pHydrogen} />,
    },
    {
      accessorKey: "density",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="р (кг/м³)" />
      ),
      cell: ({ row }) => <FixedFloatCell value={row.getValue("density")} original={row.original.density} />,
    },
    {
      accessorKey: "mineralization",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Минерализация (мг/дм³)" />
      ),
      cell: ({ row }) => <FixedFloatCell value={row.getValue("mineralization")} original={row.original.mineralization} />,
    },
    ...elementsColumns,
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
      cell: ({ row }) => <FixedFloatCell value={row.getValue("alkalinity")} original={row.original.alkalinity} />,
    },
    {
      accessorKey: "electricalConductivity",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Удельная электропроводимость, мСм/см"
        />
      ),
      cell: ({ row }) => <FixedFloatCell value={row.getValue("electricalConductivity")} original={row.original.electricalConductivity} />,
    },
    {
      accessorKey: "suspendedSolids",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Взвешенные вещества, мг/дм³"
        />
      ),
      cell: ({ row }) => <FixedFloatCell value={row.getValue("suspendedSolids")} original={row.original.suspendedSolids} />,
    },
    {
      accessorKey: "dryResidue",
      header: ({ column }) => (
        <DataTableColumnHeader 
          column={column} 
          title="Сухой остаток"
        />
      ),
      cell: ({ row }) => <FixedFloatCell value={row.getValue("dryResidue")} original={row.original.dryResidue} />,
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
              toast.success('Текст скопирован')
            }
          }}
        >
          <TooltipProvider>
            <Tooltip delayDuration={150}>
              <TooltipTrigger className="max-w-[31.25rem] truncate font-medium">
                {row.getValue("note")}
              </TooltipTrigger>
              <TooltipContent 
                className="p-3 xl:max-w-screen-lg lg:max-w-screen-md md:max-w-screen-sm max-w-xs"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                {row.original.note}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
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