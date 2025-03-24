import dynamic from 'next/dynamic';
import React from 'react'
import { toast } from 'sonner'
import { Skeleton } from '../ui/skeleton';
import { formatApproxNumber } from '~/lib/utils';
import { type ApproxEnumT } from '~/lib/types';
import { TooltipProvider } from '../ui/tooltip';

const TooltipClick = dynamic(() => import('~/components/ui/special/tooltip-click'), {
  loading: () => <Skeleton className='w-full h-5 max-w-[31.25rem]' />
});

type FixedFloatCellProps = {
  value: number | null
  original:  number | null
  approxValue?: ApproxEnumT | null
}
export default function FixedFloatCell({
  value,
  original,
  approxValue
}: FixedFloatCellProps) {

  if (value === null || original === null) return null;

  const precision = value.toString().split(".")[1]?.length ?? 0
  const fixedV = parseFloat(value.toFixed(3))

  const fixedTitle = formatApproxNumber(fixedV, approxValue)
  const originalTitle = formatApproxNumber(original, approxValue)
  const defaultTitle = formatApproxNumber(value, approxValue)

  if (precision > 3) return (
    <TooltipProvider delayDuration={150}>
      <TooltipClick 
        trigger={`${fixedTitle}...`}
        className='max-w-[31.25rem] truncate font-medium'
        classNameContent='p-2'
        onClick={() => {
          if (originalTitle === null) return;
          void navigator.clipboard.writeText(originalTitle.toString())
          toast.success('Скопировано', { duration: 2000, dismissible: true })
        }}
      >
        {originalTitle}
      </TooltipClick>
    </TooltipProvider>
  )
  else return (
    <div className="flex space-x-2">
      <span className="max-w-[31.25rem] truncate font-medium">
        {defaultTitle}
      </span>
    </div>
  )
}
