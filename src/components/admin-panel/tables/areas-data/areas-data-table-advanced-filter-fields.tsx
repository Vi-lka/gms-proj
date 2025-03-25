import { ELEMENTS } from '~/lib/static/elements'
import { type DataTableAdvancedFilterField } from '~/lib/types'
import { idToSentenceCase } from '~/lib/utils'
import { type AreaDataExtend } from '~/server/db/schema'

type Props = {
  disabled?: boolean
} | undefined

export const getAdvancedFilterFields = (props: Props): DataTableAdvancedFilterField<AreaDataExtend>[] => {

  const elementsFields: DataTableAdvancedFilterField<AreaDataExtend>[] = Object.keys(ELEMENTS).map(element => ({
    id: element as ELEMENTS,
    label: idToSentenceCase(element),
    type: "number",
    placeholder: "123",
    disabled: props?.disabled
  }))

  return [
    {
      id: "bush",
      label: idToSentenceCase("bush"),
      type: "text",
      placeholder: "Поиск...",
      disabled: props?.disabled
    },
    {
      id: "hole",
      label: idToSentenceCase("hole"),
      type: "text",
      placeholder: "Поиск...",
      disabled: props?.disabled
    },
    {
      id: "plast",
      label: idToSentenceCase("plast"),
      type: "text",
      placeholder: "Поиск...",
      disabled: props?.disabled
    },
    {
      id: "horizon",
      label: idToSentenceCase("horizon"),
      type: "text",
      placeholder: "Поиск...",
      disabled: props?.disabled
    },
    {
      id: "retinue",
      label: idToSentenceCase("retinue"),
      type: "text",
      placeholder: "Поиск...",
      disabled: props?.disabled
    },
    {
      id: "occurrenceIntervalStart",
      label: idToSentenceCase("occurrenceIntervalStart"),
      type: "number",
      placeholder: "123",
      disabled: props?.disabled

    },
    {
      id: "occurrenceIntervalEnd",
      label: idToSentenceCase("occurrenceIntervalEnd"),
      type: "number",
      placeholder: "123",
      disabled: props?.disabled
    },
    {
      id: "samplingDate",
      label: idToSentenceCase("samplingDate"),
      type: "date",
      disabled: props?.disabled
    },
    {
      id: "analysisDate",
      label: idToSentenceCase("analysisDate"),
      type: "date",
      disabled: props?.disabled
    },
    {
      id: "protocol",
      label: idToSentenceCase("protocol"),
      type: "text",
      placeholder: "Поиск...",
      disabled: props?.disabled
    },
    {
      id: "sampleCode",
      label: idToSentenceCase("sampleCode"),
      type: "text",
      placeholder: "Поиск...",
      disabled: props?.disabled
    },
    {
      id: "pHydrogen",
      label: idToSentenceCase("pHydrogen"),
      type: "number",
      placeholder: "123",
      disabled: props?.disabled
    },
    {
      id: "density",
      label: idToSentenceCase("density"),
      type: "number",
      placeholder: "123",
      disabled: props?.disabled
    },
    {
      id: "mineralization",
      label: idToSentenceCase("mineralization"),
      type: "number",
      placeholder: "123",
      disabled: props?.disabled
    },
    ...elementsFields,
    {
      id: "rigidity",
      label: idToSentenceCase("rigidity"),
      type: "number",
      placeholder: "123",
      disabled: props?.disabled
    },
    {
      id: "alkalinity",
      label: idToSentenceCase("alkalinity"),
      type: "number",
      placeholder: "123",
      disabled: props?.disabled
    },
    {
      id: "electricalConductivity",
      label: idToSentenceCase("electricalConductivity"),
      type: "number",
      placeholder: "123",
      disabled: props?.disabled
    },
    {
      id: "suspendedSolids",
      label: idToSentenceCase("suspendedSolids"),
      type: "number",
      placeholder: "123",
      disabled: props?.disabled
    },
    {
      id: "dryResidue",
      label: idToSentenceCase("dryResidue"),
      type: "number",
      placeholder: "123",
      disabled: props?.disabled
    },
    {
      id: "analysisPlace",
      label: idToSentenceCase("analysisPlace"),
      type: "text",
      placeholder: "Поиск...",
      disabled: props?.disabled,
    },
    {
      id: "note",
      label: idToSentenceCase("note"),
      type: "text",
      placeholder: "Поиск...",
      disabled: props?.disabled,
    },
  ]
}
