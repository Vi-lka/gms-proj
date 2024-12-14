"use client"
/* eslint-disable @typescript-eslint/unbound-method */
import React from 'react'
import CompanyToClusterForm from '~/components/forms/update/company-to-cluster-form'
import UpdateClusterForm from '~/components/forms/update/update-cluster-form'
import UpdateCompanyForm from '~/components/forms/update/update-company-form'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '~/components/ui/sheet'
import { type MapItemT } from '~/lib/types'

interface DefaultItemDataT {
  id: string;
  name: string;
  description: string | null;
}

interface ClusterItemDataT extends DefaultItemDataT {
  companies: {
    id: string;
    name: string;
    description: string | null;
  }[];
}

type ItemDataT = {
  type: 'cluster';
  data: ClusterItemDataT
} | {
  type: "company";
  data: DefaultItemDataT | undefined;
}

interface UpdateEllementSheetProps extends React.ComponentPropsWithRef<typeof Sheet> {
  item: MapItemT,
  onFormSubmit: (() => void) | undefined
}
  
export default function UpdateEllementSheet({ item, ...props }: UpdateEllementSheetProps) {
  const [companyToCluster, setCompanyToCluster] = React.useState(false)

  const isCluster = !!item.cluster
  
  const itemData: ItemDataT = isCluster
    ? {
      type: "cluster",
      data: {
        id: item.cluster!.id,
        name: item.cluster!.name,
        description: item.cluster!.description,
        companies: item.companies
      }
    }
    : {
      type: "company",
      data: item.companies[0]
    }

  if (!itemData.data) return null

  return (
    <Sheet {...props}>
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
                company={itemData.data}
                onFormSubmit={props.onFormSubmit}
              />
            )
            : itemData.type === "cluster"
              ? (
                <UpdateClusterForm 
                  cluster={itemData.data}
                  onFormSubmit={props.onFormSubmit}
                />
              )
              : (
                <UpdateCompanyForm
                  company={itemData.data}
                  onFormSubmit={props.onFormSubmit}
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