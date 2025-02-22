import { relations } from "drizzle-orm";
import { 
  accounts, 
  areasData, 
  authenticators, 
  clusters, 
  companies, 
  companiesToMapItems, 
  fieldMapPolygons, 
  fields, 
  fieldsMaps, 
  files, 
  licensedAreas, 
  mapItems, 
  sessions, 
  users 
} from ".";

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  authenticators: many(authenticators)
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
  user: one(users, { fields: [authenticators.userId], references: [users.id] }),
}));

export const clustersRelations = relations(clusters, ({ one }) => ({
  mapItem: one(mapItems)
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  companiesToMapItems: many(companiesToMapItems),
  fields: many(fields)
}));

export const mapItemsRelations = relations(mapItems, ({ one, many }) => ({
  cluster: one(clusters, { 
    fields: [mapItems.clusterId], 
    references: [clusters.id] 
  }),
  companiesToMapItems: many(companiesToMapItems),
  fields: many(fields)
}));

export const companiesToMapItemsRelations = relations(companiesToMapItems, ({ one }) => ({
  company: one(companies, {
    fields: [companiesToMapItems.companyId],
    references: [companies.id],
  }),
  mapItem: one(mapItems, {
    fields: [companiesToMapItems.mapItemId],
    references: [mapItems.id],
  }),
}));

export const fieldsRelations = relations(fields, ({ one, many }) => ({
  company: one(companies, { fields: [fields.companyId], references: [companies.id] }),
  mapItem: one(mapItems, { fields: [fields.mapItemId], references: [mapItems.id] }),
  fieldMap: one(fieldsMaps),
  licensedAreas: many(licensedAreas),
}));

export const licensedAreasRelations = relations(licensedAreas, ({ one, many }) => ({
  field: one(fields, { fields: [licensedAreas.fieldId], references: [fields.id] }),
  data: many(areasData),
}));

export const areasDataRelations = relations(areasData, ({ one }) => ({
  area: one(licensedAreas, { fields: [areasData.areaId], references: [licensedAreas.id] }),
}));

export const fieldsMapsRelations = relations(fieldsMaps, ({ one, many }) => ({
  field: one(fields, { fields: [fieldsMaps.fieldId], references: [fields.id] }),
  file: one(files, { fields: [fieldsMaps.fileId], references: [files.id] }),
  polygons: many(fieldMapPolygons),
}))

export const fieldMapPolygonsRelations = relations(fieldMapPolygons, ({ one }) => ({
  fieldMap: one(fieldsMaps, { fields: [fieldMapPolygons.fieldMapId], references: [fieldsMaps.id] }),
  area: one(licensedAreas, { fields: [fieldMapPolygons.areaId], references: [licensedAreas.id] }),
}))

export const filesRelations = relations(files, ({ one }) => ({
  fieldMap: one(fieldsMaps),
}))