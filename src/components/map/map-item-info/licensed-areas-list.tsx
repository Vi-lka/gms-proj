import { useAtom } from 'jotai'
import React from 'react'
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { selectedItemAtom } from '~/lib/atoms/main'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { formatDate, intervalToString } from '~/lib/utils';
import Link from 'next/link';

export default function LicensedAreasList({
  companyId,
  fieldId
}: {
  companyId: string,
  fieldId: string,
}) {
  const [selectedItem] = useAtom(selectedItemAtom)

  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  
  const onWheel = React.useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // Ignore this event unless it's a strictly vertical wheel event (horizontal wheel events are already handled by the library)
    if (!viewportRef.current || e.deltaY === 0 || e.deltaX !== 0) {
      return;
    }

    e.preventDefault();

    // Capture up/down wheel events and scroll the viewport horizontally
    const delta = e.deltaY;
    const currPos = viewportRef.current.scrollLeft;
    const scrollWidth = viewportRef.current.scrollWidth;

    const newPos = Math.max(0, Math.min(scrollWidth, currPos + delta));

    viewportRef.current.scrollTo({ left: newPos, behavior: 'instant' });
  }, []);

  const company = selectedItem?.companies.find((company) => company.id === companyId)

  const field = company?.fields.find((field) => field.id === fieldId)

  if (!field || field.licensedAreas.length === 0) return null;

  return (
    <ScrollArea.Root onWheel={onWheel} className='mt-1'>
      <ScrollArea.Viewport ref={viewportRef} className='bg-background p-2 rounded-md transition-all'>
        <Table className='p-2 rounded-md'>
          <TableHeader>
            <TableRow>
              <TableHead>Лицензионный участок</TableHead>
              <TableHead>Куст №</TableHead>
              <TableHead>Скважина №</TableHead>
              <TableHead>Пласт</TableHead>
              <TableHead>Горизонт</TableHead>
              <TableHead>Свита</TableHead>
              <TableHead>Интервал залегания (м)</TableHead>
              <TableHead>Дата отбора пробы</TableHead>
              <TableHead>Дата анализа</TableHead>
              <TableHead>№ протокола (лаборатория)</TableHead>
              <TableHead>Ссылка на протокол</TableHead>
              <TableHead>Шифр пробы (лаборатория)</TableHead>
              <TableHead>pH</TableHead>
              <TableHead>p (кг/м³)</TableHead>
              <TableHead>Минерализация (мг/дм³)</TableHead>
              <TableHead>Li+</TableHead>
              <TableHead>Rb+</TableHead>
              <TableHead>Cs+</TableHead>
              <TableHead>B</TableHead>
              <TableHead>I-</TableHead>
              <TableHead>Na+</TableHead>
              <TableHead>Ca2+</TableHead>
              <TableHead>Mg2+</TableHead>
              <TableHead>K+</TableHead>
              <TableHead>Cl-</TableHead>
              <TableHead>Br-</TableHead>
              <TableHead>Sr2+</TableHead>
              <TableHead>Ba2+</TableHead>
              <TableHead>Al3+</TableHead>
              <TableHead>Se2+</TableHead>
              <TableHead>Si</TableHead>
              <TableHead>Mn2+</TableHead>
              <TableHead>Cu2+</TableHead>
              <TableHead>Zn2+</TableHead>
              <TableHead>Ag</TableHead>
              <TableHead>W</TableHead>
              <TableHead>Ti</TableHead>
              <TableHead>V</TableHead>
              <TableHead>Cr</TableHead>
              <TableHead>Co</TableHead>
              <TableHead>Ni</TableHead>
              <TableHead>As</TableHead>
              <TableHead>Mo</TableHead>
              <TableHead>Pb</TableHead>
              <TableHead>Bi</TableHead>
              <TableHead>SO42-</TableHead>
              <TableHead>HCO3-</TableHead>
              <TableHead>CO32-</TableHead>
              <TableHead>NH4+</TableHead>
              <TableHead>F-</TableHead>
              <TableHead>NO2-</TableHead>
              <TableHead>NO3-</TableHead>
              <TableHead>PO43-</TableHead>
              <TableHead>Fe(общ)</TableHead>
              <TableHead>Жесткость, ºЖ</TableHead>
              <TableHead>Общая щелочность, ммоль/дм³</TableHead>
              <TableHead>Удельная электропроводимость, мСм/см</TableHead>
              <TableHead>Взвешенные вещества, мг/дм³</TableHead>
              <TableHead>Сухой остаток</TableHead>
              <TableHead>Место анализа</TableHead>
              <TableHead>Примечание</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {field.licensedAreas.map(area => {
              const areasData = selectedItem?.areasData.filter((data) => data.areaId === area.id)
              if (!areasData?.[0] || areasData.length === 0) return null;
              return areasData.map(data => (
                <TableRow key={`${area.id}-${data.id}`}>
                  <TableCell>{area.name}</TableCell>
                  <TableCell>{data.bush}</TableCell>
                  <TableCell>{data.hole}</TableCell>
                  <TableCell>{data.plast}</TableCell>
                  <TableCell>{data.horizon}</TableCell>
                  <TableCell>{data.retinue}</TableCell>
                  <TableCell>{intervalToString(data.occurrenceIntervalStart, data.occurrenceIntervalEnd)}</TableCell>
                  <TableCell>{data.samplingDate ? formatDate(data.samplingDate) : null}</TableCell>
                  <TableCell>{data.analysisDate ? formatDate(data.analysisDate) : null}</TableCell>
                  <TableCell>{data.protocol}</TableCell>
                  <TableCell>
                    {data.protocolUrl
                      ? (
                        <Link href={data.protocolUrl} target="__blank" passHref>
                          <span className="block max-w-52 truncate font-medium hover:underline">
                            {data.protocolUrl}
                          </span>
                        </Link>
                      )
                      : (
                        <span className="max-w-12 truncate font-medium">
                          {data.protocolUrl}
                        </span>
                      )
                    }
                  </TableCell>
                  <TableCell>{data.sampleCode}</TableCell>
                  <TableCell>{data.pHydrogen}</TableCell>
                  <TableCell>{data.density}</TableCell>
                  <TableCell>{data.mineralization}</TableCell>
                  <TableCell>{data.lithium}</TableCell>
                  <TableCell>Rb+</TableCell>
                  <TableCell>Cs+</TableCell>
                  <TableCell>B</TableCell>
                  <TableCell>I-</TableCell>
                  <TableCell>Na+</TableCell>
                  <TableCell>Ca2+</TableCell>
                  <TableCell>Mg2+</TableCell>
                  <TableCell>K+</TableCell>
                  <TableCell>Cl-</TableCell>
                  <TableCell>Br-</TableCell>
                  <TableCell>Sr2+</TableCell>
                  <TableCell>Ba2+</TableCell>
                  <TableCell>Al3+</TableCell>
                  <TableCell>Se2+</TableCell>
                  <TableCell>Si</TableCell>
                  <TableCell>Mn2+</TableCell>
                  <TableCell>Cu2+</TableCell>
                  <TableCell>Zn2+</TableCell>
                  <TableCell>Ag</TableCell>
                  <TableCell>W</TableCell>
                  <TableCell>Ti</TableCell>
                  <TableCell>V</TableCell>
                  <TableCell>Cr</TableCell>
                  <TableCell>Co</TableCell>
                  <TableCell>Ni</TableCell>
                  <TableCell>As</TableCell>
                  <TableCell>Mo</TableCell>
                  <TableCell>Pb</TableCell>
                  <TableCell>Bi</TableCell>
                  <TableCell>SO42-</TableCell>
                  <TableCell>HCO3-</TableCell>
                  <TableCell>CO32-</TableCell>
                  <TableCell>NH4+</TableCell>
                  <TableCell>F-</TableCell>
                  <TableCell>NO2-</TableCell>
                  <TableCell>NO3-</TableCell>
                  <TableCell>PO43-</TableCell>
                  <TableCell>Fe(общ)</TableCell>
                  <TableCell>Жесткость, ºЖ</TableCell>
                  <TableCell>Общая щелочность, ммоль/дм³</TableCell>
                  <TableCell>Удельная электропроводимость, мСм/см</TableCell>
                  <TableCell>Взвешенные вещества, мг/дм³</TableCell>
                  <TableCell>Сухой остаток</TableCell>
                  <TableCell>Место анализа</TableCell>
                  <TableCell>Примечание</TableCell>
                </TableRow>
              ))
            })}
          </TableBody>
        </Table>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
