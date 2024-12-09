import { z } from "zod"

export const createCompanySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  clusterId: z.string().optional(),
})
export type CreateCompanySchema = z.infer<typeof createCompanySchema>

export const createClusterSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  image: z.string().nullable(),
  companies: createCompanySchema.array().min(1, { message: "Должна быть хотя бы 1 компания" })
})
export type CreateClusterSchema = z.infer<typeof createClusterSchema>

export const createMapItemSchema = z.object({
  description: z.string().nullable(),
  xPos: z.number(),
  yPos: z.number()
})
export type CreateMapItemSchema = z.infer<typeof createMapItemSchema>