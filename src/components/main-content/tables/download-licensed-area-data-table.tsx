import { TooltipTrigger } from '@radix-ui/react-tooltip'
import { Loader } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider } from '~/components/ui/tooltip'
import { cn, convertDataForExport, downloadExcel } from '~/lib/utils'
import { type GetAreasDataSchema } from '~/lib/validations/areas-data'
import { getAreasData } from '~/server/queries/area-data'

type ConditionalProps =
  | {
      type: "licensedArea",
      licensedAreaId: string,
    }
  | {
      type: "field",
      fieldId: string,
    }
  | {
      type: "fields",
      fieldsIds: string[],
    }
  | {
      type: "all",
    };

type DownloadLicensedAreaDataTableProps = {
  searchParams: GetAreasDataSchema
  className?: string,
  disabled?: boolean,
  children?: React.ReactNode
} & ConditionalProps

export default function DownloadLicensedAreaDataTable({
  searchParams,
  className,
  disabled,
  children,
  ...props
}: DownloadLicensedAreaDataTableProps) {
  const [isPending, startTransition] = React.useTransition()

  const handleDownload = React.useCallback(() => {
    startTransition(async () => {
      const areaData = await getAreasData({
        ...searchParams,
        page: 1,
        perPage: 1000000000,
        areaId: props.type === "licensedArea" ? props.licensedAreaId : "",
        fieldId: props.type === "field" ? props.fieldId : "",
        fieldsIds: props.type === "fields" ? props.fieldsIds : null,
      })

      const { data, error } = areaData;

      if (error !== null) {
        toast.error(error, { id: "data-error", duration: 5000, dismissible: true })
        return;
      }

      let fileName = "Данные ГМС"

      const dataToDownload: Record<string, {name: string, data: unknown[]}> = {}

      if (props.type === "licensedArea") {
        const key = data[0]?.areaId ?? "0"
        const name = data[0]?.areaName ?? "Лицензионный участок"
        const fieldName = data[0]?.fieldName ?? "Месторождение"
        fileName += " " + `(${name})`
        dataToDownload[key] = { name: fieldName, data: convertDataForExport(data) }
      }
      if (props.type === "field") {
        const key = data[0]?.fieldId ?? "0"
        const name = data[0]?.fieldName ?? "Месторождение"
        fileName += " " + `(${name})`
        dataToDownload[key] = { name, data: convertDataForExport(data) }
      }
      if (props.type === "fields") {
        const companyName = data[0]?.companyName ?? "Компания"
        fileName += " " + `(${companyName})`

        const uniqueFields = data.map((item) => ({
          id: item.fieldId,
          name: item.fieldName
        })).filter((value, index, array) => 
          index === array.findIndex((t) => t.id === value.id)
        );

        uniqueFields.forEach((field) => {
          const key = field.id
          const name = field.name
          const thisFieldData = data.filter((item) => item.fieldId === field.id)
          dataToDownload[key] = {
            name,
            data: convertDataForExport(thisFieldData)
          }
        })
      }

      if (props.type === "all") {
        const uniqueCompanies = data.map((item) => ({
          id: item.companyId,
          name: item.companyName
        })).filter((value, index, array) => 
          index === array.findIndex((t) => t.id === value.id)
        );

        uniqueCompanies.forEach((company) => {
          const key = company.id
          const name = company.name
          const thisCompanyData = data.filter((item) => item.companyId === company.id)
          dataToDownload[key] = {
            name,
            data: convertDataForExport(thisCompanyData)
          }
        })
      }

      downloadExcel(dataToDownload, fileName)
    })
  }, [props, searchParams])

  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>
          <Button 
            className={cn("", className)}
            disabled={disabled ?? isPending}
            onClick={handleDownload}
          >
            {isPending 
              ? (
                <Loader className="flex-none size-4 animate-spin" />
              ) 
              : children ?? "Скачать"
            }
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Скачать таблицу
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
