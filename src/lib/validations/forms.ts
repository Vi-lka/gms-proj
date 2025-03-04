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
  description: z.string().nullable(),
})
export type CreateCompanySchema = z.infer<typeof createCompanySchema>

export const updateCompanySchema = createCompanySchema.extend({
  id: z.string().min(1),
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
  companies: updateCompanySchema.array().min(1, { message: "Должна быть хотя бы 1 компания" })
})
export type UpdateClusterSchema = z.infer<typeof updateClusterSchema>


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


// MAP ITEM
export const MapItemSchema = z.object({
  description: z.string().nullable(),
  xPos: z.number(),
  yPos: z.number()
})
export type MapItemSchema = z.infer<typeof MapItemSchema>

export const createMapItemSchema = z.object({
  id: z.string({required_error: "Выберите компанию"}).min(1, "Выберите компанию"),
  fields: z.string().array().min(1, "Выберите месторождение")
})
export type CreateMapItemSchema = z.infer<typeof createMapItemSchema>

export const createMapItemClusterSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  companiesInput: createMapItemSchema.array().min(2, { message: "Должно быть хотя бы 2 компании" }),
})
export type CreateMapItemClusterSchema = z.infer<typeof createMapItemClusterSchema>

export const companyToClusterSchema = z.object({
  mapItemId: z.string(),
  name: z.string().min(1),
  description: z.string().nullable(),
  companiesInput: createMapItemSchema.array().min(2, { message: "Должно быть хотя бы 2 компании" }),
})
export type CompanyToClusterSchema = z.infer<typeof companyToClusterSchema>

export const updateMapItemCompanySchema = z.object({
  id: z.string({required_error: "Выберите компанию"}).min(1, "Выберите компанию"),
  mapItemId: z.string(),
  fields: z.string().array().min(1, "Выберите месторождение")
})
export type UpdateMapItemCompanySchema = z.infer<typeof updateMapItemCompanySchema>

export const updateMapItemClusterSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().nullable(),
  companiesInput: createMapItemSchema.array().min(2, { message: "Должно быть хотя бы 2 компании" }),
  mapItemId: z.string(),
})
export type UpdateMapItemClusterSchema = z.infer<typeof updateMapItemClusterSchema>



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
  rubidium: z.number().nullable(),
  cesium: z.number().nullable(),
  boron: z.number().nullable(),
  iodine: z.number().nullable(),
  sodium: z.number().nullable(),
  calcium: z.number().nullable(),
  magnesium: z.number().nullable(),
  potassium: z.number().nullable(),
  chlorine: z.number().nullable(),
  bromine: z.number().nullable(),
  strontium: z.number().nullable(),
  barium: z.number().nullable(),
  aluminum: z.number().nullable(),
  selenium: z.number().nullable(),
  silicon: z.number().nullable(),
  manganese: z.number().nullable(),
  copper: z.number().nullable(),
  zinc: z.number().nullable(),
  silver: z.number().nullable(),
  tungsten: z.number().nullable(),
  titanium: z.number().nullable(),
  vanadium: z.number().nullable(),
  chromium: z.number().nullable(),
  cobalt: z.number().nullable(),
  nickel: z.number().nullable(),
  arsenic: z.number().nullable(),
  molybdenum: z.number().nullable(),
  plumbum: z.number().nullable(),
  bismuth: z.number().nullable(),
  sulfateIon: z.number().nullable(),
  bicarbonate: z.number().nullable(),
  carbonateIon: z.number().nullable(),
  ammonium: z.number().nullable(),
  fluorine: z.number().nullable(),
  nitrogenDioxide: z.number().nullable(),
  nitrate: z.number().nullable(),
  phosphate: z.number().nullable(),
  ferrum: z.number().nullable(),
})
export type ElementsSchema = z.infer<typeof elementsSchema>

export const elementsWithApproxSchema = elementsSchema.extend({
  lithiumApprox: approxEnumSchema.nullable(),
  rubidiumApprox: approxEnumSchema.nullable(), 
  cesiumApprox: approxEnumSchema.nullable(), 
  boronApprox: approxEnumSchema.nullable(), 
  iodineApprox: approxEnumSchema.nullable(), 
  sodiumApprox: approxEnumSchema.nullable(), 
  calciumApprox: approxEnumSchema.nullable(), 
  magnesiumApprox: approxEnumSchema.nullable(), 
  potassiumApprox: approxEnumSchema.nullable(), 
  chlorineApprox: approxEnumSchema.nullable(), 
  bromineApprox: approxEnumSchema.nullable(), 
  strontiumApprox: approxEnumSchema.nullable(), 
  bariumApprox: approxEnumSchema.nullable(), 
  aluminumApprox: approxEnumSchema.nullable(), 
  seleniumApprox: approxEnumSchema.nullable(), 
  siliconApprox: approxEnumSchema.nullable(), 
  manganeseApprox: approxEnumSchema.nullable(), 
  copperApprox: approxEnumSchema.nullable(), 
  zincApprox: approxEnumSchema.nullable(), 
  silverApprox: approxEnumSchema.nullable(), 
  tungstenApprox: approxEnumSchema.nullable(), 
  titaniumApprox: approxEnumSchema.nullable(), 
  vanadiumApprox: approxEnumSchema.nullable(), 
  chromiumApprox: approxEnumSchema.nullable(), 
  cobaltApprox: approxEnumSchema.nullable(), 
  nickelApprox: approxEnumSchema.nullable(), 
  arsenicApprox: approxEnumSchema.nullable(), 
  molybdenumApprox: approxEnumSchema.nullable(), 
  plumbumApprox: approxEnumSchema.nullable(), 
  bismuthApprox: approxEnumSchema.nullable(), 
  sulfateIonApprox: approxEnumSchema.nullable(), 
  bicarbonateApprox: approxEnumSchema.nullable(), 
  carbonateIonApprox: approxEnumSchema.nullable(), 
  ammoniumApprox: approxEnumSchema.nullable(), 
  fluorineApprox: approxEnumSchema.nullable(), 
  nitrogenDioxideApprox: approxEnumSchema.nullable(), 
  nitrateApprox: approxEnumSchema.nullable(), 
  phosphateApprox: approxEnumSchema.nullable(), 
  ferrumApprox: approxEnumSchema.nullable(),
})
export type ElementsWithApproxSchema = z.infer<typeof elementsWithApproxSchema>

export const createAreasDataSchema = elementsWithApproxSchema.extend({
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


// FIELD MAP
export const createFieldMapSchema = z.object({
  fieldId: z.string().min(1, "Выберите Месторождение"),
  fileId: z.string().min(1, "Загрузите Фото"),
  fileName: z.string().min(1, "Загрузите Фото"),
  polygons: z.object({
    areaId: z.string().min(1, "Выберите Лицензионный участок"),
    points: z.number().array().min(6, { message: "Должно быть хотя бы 3 точки" })
  }).array().min(1, { message: "Должен быть хотя бы 1 полигон" })
})
export type CreateFieldMapSchema = z.infer<typeof createFieldMapSchema>;

export const updateFieldMapSchema = z.object({
  id: z.string().min(1),
  fieldId: z.string().min(1, "Выберите Месторождение"),
  fileId: z.string().optional(),
  fileName: z.string().optional(),
  polygons: z.object({
    id: z.string().min(1),
    areaId: z.string().min(1, "Выберите Лицензионный участок"),
    points: z.number().array().min(6, { message: "Должно быть хотя бы 3 точки" })
  }).array().min(1, { message: "Должен быть хотя бы 1 полигон" })
})
export type UpdateFieldMapSchema = z.infer<typeof updateFieldMapSchema>;


// PROFITABILITY
export const createProfitabilitySchema = elementsSchema
export type CreateProfitabilitySchema = z.infer<typeof createProfitabilitySchema>;

export const updateProfitabilitySchema = createProfitabilitySchema.extend({
  id: z.string().min(1),
})
export type UpdateProfitabilitySchema = z.infer<typeof updateProfitabilitySchema>;