"use client"
/* eslint-disable @typescript-eslint/unbound-method */
import React from 'react'
import CompanyToClusterForm from '~/components/forms/update/company-to-cluster-form'
import UpdateClusterForm from '~/components/forms/update/update-cluster-form'
import UpdateCompanyMapItemForm from '~/components/forms/update/update-company-map-item-form'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { type MapItemT } from '~/lib/types'

interface DefaultItemDataT {
  id: string;
  name: string;
  description: string | null;
  mapItemId: string;
}

interface CompanyItemDataT extends DefaultItemDataT {
  fields: string[];
}

interface ClusterItemDataT extends DefaultItemDataT {
  companiesInput: {
    id: string;
    name: string;
    description: string | null;
    fields: string[];
  }[];
}

type ItemDataT = {
  type: 'cluster';
  data: ClusterItemDataT
} | {
  type: "company";
  data: CompanyItemDataT | undefined;
}

interface UpdateEllementSheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
  item: MapItemT,
  onFormSubmit: (() => void) | undefined
}
  
export default function UpdateEllementSheet({ item, onFormSubmit, onOpenChange, ...props }: UpdateEllementSheetProps) {
  const [companyToCluster, setCompanyToCluster] = React.useState(false)

  const isCluster = !!item.cluster
  
  const itemData: ItemDataT = isCluster
    ? {
      type: "cluster",
      data: {
        id: item.cluster!.id,
        name: item.cluster!.name,
        description: item.cluster!.description,
        mapItemId: item.id,
        companiesInput: item.companies.map(({fields, ...rest}) => (
          {
            fields: fields.map(field => field.id),
            ...rest
          }
        )),
      }
    }
    : {
      type: "company",
      data: item.companies[0] && {
        ...item.companies[0],
        mapItemId: item.id,
        fields: item.fields.map(field => field.id)
      }
    }

  if (!itemData.data) return null

  return (
    <Sheet 
      onOpenChange={(open) => {
        setCompanyToCluster(false)
        if (onOpenChange) onOpenChange(open)
      }}
      {...props}
    >
      <SheetContent className="flex flex-col gap-6 sm:max-w-md">
        <SheetHeader className="text-left">
          <SheetTitle>Изменить</SheetTitle>
          <SheetDescription>
            {isCluster 
              ? `Кластер: ${itemData.data.name}` 
              : `Компанию: ${itemData.data.name}`
            }
          </SheetDescription>
        </SheetHeader>
        <ScrollArea classNameViewport='p-3'>
          {companyToCluster 
            ? (
              <CompanyToClusterForm 
                company={itemData.data as CompanyItemDataT}
                onFormSubmit={onFormSubmit}
              />
            )
            : itemData.type === "cluster"
              ? (
                <UpdateClusterForm 
                  cluster={itemData.data}
                  onFormSubmit={onFormSubmit}
                />
              )
              : (
                <UpdateCompanyMapItemForm
                  company={itemData.data}
                  onFormSubmit={onFormSubmit}
                />
              )
          }
          {!isCluster && (
            <Button
              className='flex ml-auto mr-0 mt-12'
              variant="secondary"
              onClick={() => setCompanyToCluster((value) => !value)}
            >
              {companyToCluster
                ? "Назад"
                : "Добавить в Кластер"
              }
            </Button>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}