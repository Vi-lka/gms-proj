import { useAtom } from 'jotai';
import React from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion'
import { selectedItemAtom } from '~/lib/atoms/main';
import FieldsList from './fields-list';

export default function CompaniesList() {
  const [selectedItem] = useAtom(selectedItemAtom)

  const companies = selectedItem?.companies

  if (!companies?.[0] || companies.length === 0) return null;

  if (companies.length === 1) return (
    <div>
      <p className="flex flex-1 items-center justify-between py-2 text-sm font-medium text-left">
        {companies[0].name}
      </p>
      <FieldsList companyId={companies[0].id} />
    </div>
  );

  return (
    <Accordion type="single" collapsible className='space-y-2'>
      {companies.map((company) => (
        <AccordionItem key={company.id} value={company.id}>
          <AccordionTrigger className="rounded-md">{company.name}</AccordionTrigger>
          <AccordionContent>
            <FieldsList companyId={company.id} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
