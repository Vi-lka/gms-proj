import { useAtom } from 'jotai'
import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { selectedItemAtom } from '~/lib/atoms/main'
import LicensedAreasList from './licensed-areas-list'

export default function FieldsList({
  companyId,
}: {
  companyId: string
}) {
  const [selectedItem] = useAtom(selectedItemAtom)

  const company = selectedItem?.companies.find((company) => company.id === companyId)

  const fields = company?.fields.filter((field) => field.companyId === companyId)

  if (!fields?.[0] || fields.length === 0) return null;

  if (fields.length === 1) return (
    <div className='bg-muted rounded-md shadow-md py-4'>
      <p className="flex flex-1 items-center justify-between px-6 py-2 text-sm font-medium text-left">
        {fields[0].name}
      </p>
      <div className='px-6'>
        <LicensedAreasList companyId={companyId} fieldId={fields[0].id} />
      </div>
    </div>
  );

  return (
    <Accordion type="single" collapsible className='space-y-2'>
      {fields.map((field) => (
        <AccordionItem key={field.id} value={field.id} className='bg-muted rounded-md shadow-md'>
          <AccordionTrigger className="rounded-md px-6">{field.name}</AccordionTrigger>
          <AccordionContent className='px-6'>
            <LicensedAreasList companyId={companyId} fieldId={field.id} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
