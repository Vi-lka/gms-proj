import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui/sheet'
import { createAreasDataSchema, type ElementsWithApproxSchema, type CreateAreasDataSchema } from '~/lib/validations/forms'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Loader, Plus } from 'lucide-react'
import { Form } from '~/components/ui/form'
import { ScrollArea } from '~/components/ui/scroll-area'
import LicensedAreaSelect from '~/components/forms/inputs/licensed-area-select'
import InputField from '~/components/forms/inputs/simple/input-field'
import { idToSentenceCase } from '~/lib/utils'
import defaultValues, { defaultValuesElements } from './default-values'
import NumberField from '~/components/forms/inputs/simple/number-field'
import IntervalField from '~/components/forms/inputs/simple/interval-field'
import DateField from '~/components/forms/inputs/simple/date-field'
import NumberApproxField from '~/components/forms/inputs/simple/number-approx-field'
import TextareaField from '~/components/forms/inputs/simple/textarea-field'
import { Separator } from '~/components/ui/separator'
import { createAreasData } from '~/server/actions/areas-data'
import { errorToast } from '~/components/ui/special/error-toast'

type CreateAreasDataSheetProps = React.ComponentPropsWithRef<typeof Sheet>

export default function CreateAreasDataSheet({
  ...props
}: CreateAreasDataSheetProps) {
  const [isPending, startTransition] = React.useTransition()

  const form = useForm<CreateAreasDataSchema>({
    resolver: zodResolver(createAreasDataSchema),
    defaultValues,
    mode: "onChange"
  })

  function onSubmit(input: CreateAreasDataSchema) {
    startTransition(async () => {
      const { error } = await createAreasData(input)

      if (error) {
        errorToast(error, {id: "data-error"})
        return
      }

      form.reset()
      props.onOpenChange?.(false)
      toast.success("Данные ЛУ созданы!")
    })
  }

  const saveDisabled = isPending || !form.formState.isValid

  return (
    <Sheet {...props}>
      <SheetTrigger asChild>
        <Button 
          size="sm"
          className="gap-2 h-7"
        >
          Создать <Plus size={16} className='flex-none' />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="flex flex-col gap-6">
        <SheetHeader className="text-left">
          <SheetTitle>Создать Данные ЛУ</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <ScrollArea type="always" classNameViewport='p-3 xl:max-h-[70vh] lg:max-h-[65vh] max-h-[60vh]'>
              <div className='flex flex-wrap items-center md:gap-x-3 md:gap-y-6 gap-x-2 gap-y-4 lg:px-3'>
                <LicensedAreaSelect
                  form={form}
                  name="areaId"
                  label="Лицензионный участок"
                  handleClear={() => {
                    form.setValue(
                      'areaId', 
                      '', 
                      {shouldDirty: true, shouldTouch: true, shouldValidate: true}
                    )
                  }}
                  onSelect={(item) => {
                    if (item !== null) form.setValue(
                      'name', 
                      item.label, 
                      {shouldDirty: true, shouldTouch: true, shouldValidate: true}
                    )
                  }}
                  className='w-72'
                />
                <InputField
                  form={form}
                  name="bush"
                  label={idToSentenceCase("bush")}
                />
                <InputField
                  form={form}
                  name="hole"
                  label={idToSentenceCase("hole")}
                />
                <InputField
                  form={form}
                  name="plast"
                  label={idToSentenceCase("plast")}
                />
                <InputField
                  form={form}
                  name="horizon"
                  label={idToSentenceCase("horizon")}
                />
                <InputField
                  form={form}
                  name="retinue"
                  label={idToSentenceCase("retinue")}
                />
                <IntervalField 
                  form={form}
                  nameStart="occurrenceIntervalStart"
                  nameEnd="occurrenceIntervalEnd"
                  label={idToSentenceCase("occurrenceInterval")}
                />
                <DateField 
                  form={form} 
                  name={"samplingDate"}
                  label={idToSentenceCase("samplingDate")}
                />
                <DateField
                  form={form}
                  name={"analysisDate"}
                  label={idToSentenceCase("analysisDate")}
                />
                <InputField
                  form={form}
                  name="protocol"
                  label={idToSentenceCase("protocol")}
                />
                <InputField
                  form={form}
                  name="protocolUrl"
                  placeholder='https://site.com/'
                  label={idToSentenceCase("protocolUrl")}
                />
                <InputField
                  form={form}
                  name="sampleCode"
                  label={idToSentenceCase("sampleCode")}
                />
                <Separator className='w-full my-4 rounded-full'/>
                <NumberField
                  form={form}
                  name="pHydrogen"
                  label={idToSentenceCase("pHydrogen")}
                />
                <NumberField
                  form={form}
                  name="density"
                  label={idToSentenceCase("density")}
                />
                <NumberField
                  form={form}
                  name="mineralization"
                  label={idToSentenceCase("mineralization")}
                  className='max-w-44'
                />
                <Separator className='w-full my-4 rounded-full'/>
                {defaultValuesElements.map((item, indx) => {
                  const keys = Object.keys(item)
                  return (
                    <NumberApproxField
                      key={"element-"+indx.toString()}
                      form={form}
                      name={keys[0] as keyof ElementsWithApproxSchema}
                      nameApprox={keys[1] as keyof ElementsWithApproxSchema}
                      label={idToSentenceCase(keys[0]!)}
                    />
                  )
                })}
                <Separator className='w-full my-4 rounded-full'/>
                <NumberField
                  form={form}
                  name="rigidity"
                  label={idToSentenceCase("rigidity")}
                />
                <NumberField
                  form={form}
                  name="alkalinity"
                  label={idToSentenceCase("alkalinity")}
                  className='max-w-60'
                />
                <NumberField
                  form={form}
                  name="electricalConductivity"
                  label={idToSentenceCase("electricalConductivity")}
                  className='max-w-80'
                />
                <NumberField
                  form={form}
                  name="suspendedSolids"
                  label={idToSentenceCase("suspendedSolids")}
                  className='max-w-56'
                />
                <NumberField
                  form={form}
                  name="dryResidue"
                  label={idToSentenceCase("dryResidue")}
                />
                <InputField
                  form={form}
                  name="analysisPlace"
                  label={idToSentenceCase("analysisPlace")}
                />
                <Separator className='w-full my-4 rounded-full'/>
                <TextareaField
                  form={form}
                  name="note"
                  label={idToSentenceCase("note")}
                  className='w-full'
                  classNameInput='min-h-32'
                />
              </div>
            </ScrollArea>
            <SheetFooter className="gap-2 pt-2 sm:space-x-0">
              <SheetClose asChild>
                <Button type="button" variant="outline">
                  Отмена
                </Button>
              </SheetClose>
              <Button disabled={saveDisabled}>
                {isPending && <Loader className="mr-2 size-4 animate-spin" />}
                Создать
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
