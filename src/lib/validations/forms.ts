import { z } from "zod"
import { approxEnumSchema } from "../types"

//  COMPANY
export const companySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().nullable(),
})
export type CompanySchema = z.infer<typeof companySchema>

export const createCompanySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  clusterId: z.string().optional(),
})
export type CreateCompanySchema = z.infer<typeof createCompanySchema>

export const updateCompanySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().nullable(),
})
export type UpdateCompanySchema = z.infer<typeof updateCompanySchema>




// CLUSTER
export const createClusterSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  companies: createCompanySchema.array().min(1, { message: "Должна быть хотя бы 1 компания" })
})
export type CreateClusterSchema = z.infer<typeof createClusterSchema>

export const updateClusterSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().nullable(),
  companies: companySchema.array().min(1, { message: "Должна быть хотя бы 1 компания" })
})
export type UpdateClusterSchema = z.infer<typeof updateClusterSchema>




// MAP ITEM
export const MapItemSchema = z.object({
  description: z.string().nullable(),
  xPos: z.number(),
  yPos: z.number()
})
export type MapItemSchema = z.infer<typeof MapItemSchema>

export const createMapItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  companyId: z.string().nullable().optional()
}).or(
  z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    companyId: z.string().min(1, "Выберите компанию")
  })
)
// .superRefine(({ name, companyId }, ctx) => {
//   if ((companyId !== undefined) && (companyId !== null)) {
//     return 
//   } else if (name && name?.length < 1) {
//     ctx.addIssue({
//       code: "custom",
//       message: "Строка должна содержать хотя бы 1 символ",
//       path: ['name']
//     });
//   }
// })
export type CreateMapItemSchema = z.infer<typeof createMapItemSchema>

export const createMapItemClusterSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  companiesInput: createMapItemSchema.array().min(2, { message: "Должно быть хотя бы 2 компании" }),
  clusterId: z.string().nullable().optional()
}).or(
  z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    companiesInput: createMapItemSchema.array().optional(),
    clusterId: z.string().min(1, "Выберите Кластер")
  })
)
export type CreateMapItemClusterSchema = z.infer<typeof createMapItemClusterSchema>

export const companyToClusterSchema = z.object({
  mapItemId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  companiesInput: createMapItemSchema.array().min(2, { message: "Должно быть хотя бы 2 компании" }),
  clusterId: z.string().nullable().optional()
}).or(
  z.object({
    mapItemId: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    companiesInput: createMapItemSchema.array().min(1, { message: "Должно быть хотя бы 1 компании" }),
    clusterId: z.string().min(1, "Выберите Кластер")
  })
)
export type CompanyToClusterSchema = z.infer<typeof companyToClusterSchema>



// FIELD
export const createFieldSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  companyId: z.string().min(1, "Выберите компанию")
})
export type CreateFieldSchema = z.infer<typeof createFieldSchema>

export const updateFieldSchema = createFieldSchema.extend({
  id: z.string().min(1),
})
export type UpdateFieldSchema = z.infer<typeof updateFieldSchema>



// LICENSED AREA
export const createLicensedAreaSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  fieldId: z.string().min(1, "Выберите Месторождение"),
})
export type CreateLicensedAreaSchema = z.infer<typeof createLicensedAreaSchema>

export const updateLicensedAreaSchema = createLicensedAreaSchema.extend({
  id: z.string().min(1),
})
export type UpdateLicensedAreaSchema = z.infer<typeof updateLicensedAreaSchema>



// AREAS DATA
export const elementsSchema = z.object({
  lithium: z.number().nullable(),
  lithiumApprox: approxEnumSchema.nullable(),
  rubidium: z.number().nullable(),
  rubidiumApprox: approxEnumSchema.nullable(), 
  cesium: z.number().nullable(),
  cesiumApprox: approxEnumSchema.nullable(), 
  boron: z.number().nullable(),
  boronApprox: approxEnumSchema.nullable(), 
  iodine: z.number().nullable(),
  iodineApprox: approxEnumSchema.nullable(), 
  sodium: z.number().nullable(),
  sodiumApprox: approxEnumSchema.nullable(), 
  calcium: z.number().nullable(),
  calciumApprox: approxEnumSchema.nullable(), 
  magnesium: z.number().nullable(),
  magnesiumApprox: approxEnumSchema.nullable(), 
  potassium: z.number().nullable(),
  potassiumApprox: approxEnumSchema.nullable(), 
  chlorine: z.number().nullable(),
  chlorineApprox: approxEnumSchema.nullable(), 
  bromine: z.number().nullable(),
  bromineApprox: approxEnumSchema.nullable(), 
  strontium: z.number().nullable(),
  strontiumApprox: approxEnumSchema.nullable(), 
  barium: z.number().nullable(),
  bariumApprox: approxEnumSchema.nullable(), 
  aluminum: z.number().nullable(),
  aluminumApprox: approxEnumSchema.nullable(), 
  selenium: z.number().nullable(),
  seleniumApprox: approxEnumSchema.nullable(), 
  silicon: z.number().nullable(),
  siliconApprox: approxEnumSchema.nullable(), 
  manganese: z.number().nullable(),
  manganeseApprox: approxEnumSchema.nullable(), 
  copper: z.number().nullable(),
  copperApprox: approxEnumSchema.nullable(), 
  zinc: z.number().nullable(),
  zincApprox: approxEnumSchema.nullable(), 
  silver: z.number().nullable(),
  silverApprox: approxEnumSchema.nullable(), 
  tungsten: z.number().nullable(),
  tungstenApprox: approxEnumSchema.nullable(), 
  titanium: z.number().nullable(),
  titaniumApprox: approxEnumSchema.nullable(), 
  vanadium: z.number().nullable(),
  vanadiumApprox: approxEnumSchema.nullable(), 
  chromium: z.number().nullable(),
  chromiumApprox: approxEnumSchema.nullable(), 
  cobalt: z.number().nullable(),
  cobaltApprox: approxEnumSchema.nullable(), 
  nickel: z.number().nullable(),
  nickelApprox: approxEnumSchema.nullable(), 
  arsenic: z.number().nullable(),
  arsenicApprox: approxEnumSchema.nullable(), 
  molybdenum: z.number().nullable(),
  molybdenumApprox: approxEnumSchema.nullable(), 
  plumbum: z.number().nullable(),
  plumbumApprox: approxEnumSchema.nullable(), 
  bismuth: z.number().nullable(),
  bismuthApprox: approxEnumSchema.nullable(), 
  sulfateIon: z.number().nullable(),
  sulfateIonApprox: approxEnumSchema.nullable(), 
  bicarbonate: z.number().nullable(),
  bicarbonateApprox: approxEnumSchema.nullable(), 
  carbonateIon: z.number().nullable(),
  carbonateIonApprox: approxEnumSchema.nullable(), 
  ammonium: z.number().nullable(),
  ammoniumApprox: approxEnumSchema.nullable(), 
  fluorine: z.number().nullable(),
  fluorineApprox: approxEnumSchema.nullable(), 
  nitrogenDioxide: z.number().nullable(),
  nitrogenDioxideApprox: approxEnumSchema.nullable(), 
  nitrate: z.number().nullable(),
  nitrateApprox: approxEnumSchema.nullable(), 
  phosphate: z.number().nullable(),
  phosphateApprox: approxEnumSchema.nullable(), 
  ferrum: z.number().nullable(),
  ferrumApprox: approxEnumSchema.nullable(),
})
export type ElementsSchema = z.infer<typeof elementsSchema>

export const createAreasDataSchema = elementsSchema.extend({
  areaId: z.string().min(1, "Выберите Лицензионный участок"),
  bush: z.string().nullable(),
  hole: z.string().nullable(),
  plast: z.string().nullable(),
  horizon: z.string().nullable(),
  retinue: z.string().nullable(),
  occurrenceIntervalStart: z.number().nullable(),
  occurrenceIntervalEnd: z.number().nullable(),
  samplingDate: z.date().or(z.string()).nullable(),
  analysisDate: z.date().or(z.string()).nullable(),
  protocol: z.string().nullable(),
  protocolUrl: z.string().url().nullable(),
  sampleCode: z.string().nullable(),
  pHydrogen: z.number().nullable(),
  density: z.number().nullable(),
  mineralization: z.number().nullable(),
  rigidity: z.number().nullable(),
  alkalinity: z.number().nullable(),
  electricalConductivity: z.number().nullable(),
  suspendedSolids: z.number().nullable(),
  dryResidue: z.number().nullable(),
  analysisPlace: z.string().nullable(),
  note: z.string().nullable(),
})
export type CreateAreasDataSchema = z.infer<typeof createAreasDataSchema>

export const updateAreasDataSchema = createAreasDataSchema.extend({
  id: z.string().min(1),
})
export type UpdateAreasDataSchema = z.infer<typeof updateAreasDataSchema>;