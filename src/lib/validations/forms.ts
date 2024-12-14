import { z } from "zod"

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

export const companyToClusterSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  companies: companySchema.array().min(1, { message: "Должна быть хотя бы 1 компания" })
})
export type CompanyToClusterSchema = z.infer<typeof companyToClusterSchema>




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
export const createMapItemSchema = z.object({
  description: z.string().nullable(),
  xPos: z.number(),
  yPos: z.number()
})
export type CreateMapItemSchema = z.infer<typeof createMapItemSchema>