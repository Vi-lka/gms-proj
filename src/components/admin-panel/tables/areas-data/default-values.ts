import { ELEMENTS } from "~/lib/static/elements";
import { type CreateAreasDataSchema, type ElementsWithApproxSchema } from "~/lib/validations/forms";

type ElementEntry = Record<ELEMENTS | `${ELEMENTS}Approx`, null>;

export const defaultValuesElements: ElementEntry[] = Object.values(ELEMENTS).map(element => {
    return {
        [element]: null,
        [`${element}Approx`]: null
    } as ElementEntry;
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const elementsObj: ElementsWithApproxSchema = Object.assign({}, ...defaultValuesElements);

const defaultValues: CreateAreasDataSchema = {
    name: "",
    areaId: "",
    bush: "",
    hole: "",
    plast: "",
    horizon: "",
    retinue: "",
    occurrenceIntervalStart: null,
    occurrenceIntervalEnd: null,
    samplingDate: null,
    analysisDate: null,
    protocol: "",
    protocolUrl: null,
    sampleCode: "",
    pHydrogen: null,
    density: null,
    mineralization: null,
    ...elementsObj,
    rigidity: null,
    alkalinity: null,
    electricalConductivity: null,
    suspendedSolids: null,
    dryResidue: null,
    analysisPlace: "",
    note: ""
}

export default defaultValues