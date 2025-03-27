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
  mapData, 
  mapItems, 
  profitability, 
  sessions, 
  users 
} from ".";

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  authenticators: many(authenticators),
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

export const mapDataRelations = relations(mapData, ({ one }) => ({
  file: one(files, { fields: [mapData.fileId], references: [files.id] }),
  userCreated: one(users, { fields: [mapData.createUserId], references: [users.id] }),
  userUpdated: one(users, { fields: [mapData.updateUserId], references: [users.id] }),
}))

export const profitabilityRelations = relations(profitability, ({ one }) => ({
  userCreated: one(users, { fields: [profitability.createUserId], references: [users.id] }),
  userUpdated: one(users, { fields: [profitability.updateUserId], references: [users.id] }),
}))

export const clustersRelations = relations(clusters, ({ one }) => ({
  mapItem: one(mapItems),
  userCreated: one(users, { fields: [clusters.createUserId], references: [users.id] }),
  userUpdated: one(users, { fields: [clusters.updateUserId], references: [users.id] }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  companiesToMapItems: many(companiesToMapItems),
  fields: many(fields),
  userCreated: one(users, { fields: [companies.createUserId], references: [users.id] }),
  userUpdated: one(users, { fields: [companies.updateUserId], references: [users.id] }),
}));

export const mapItemsRelations = relations(mapItems, ({ one, many }) => ({
  cluster: one(clusters, { 
    fields: [mapItems.clusterId], 
    references: [clusters.id] 
  }),
  companiesToMapItems: many(companiesToMapItems),
  fields: many(fields),
  userCreated: one(users, { fields: [mapItems.createUserId], references: [users.id] }),
  userUpdated: one(users, { fields: [mapItems.updateUserId], references: [users.id] }),
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
  userCreated: one(users, { fields: [companiesToMapItems.createUserId], references: [users.id] }),
  userUpdated: one(users, { fields: [companiesToMapItems.updateUserId], references: [users.id] }),
}));

export const fieldsRelations = relations(fields, ({ one, many }) => ({
  company: one(companies, { fields: [fields.companyId], references: [companies.id] }),
  mapItem: one(mapItems, { fields: [fields.mapItemId], references: [mapItems.id] }),
  fieldMap: one(fieldsMaps),
  licensedAreas: many(licensedAreas),
  userCreated: one(users, { fields: [fields.createUserId], references: [users.id] }),
  userUpdated: one(users, { fields: [fields.updateUserId], references: [users.id] }),
}));

export const licensedAreasRelations = relations(licensedAreas, ({ one, many }) => ({
  field: one(fields, { fields: [licensedAreas.fieldId], references: [fields.id] }),
  data: many(areasData),
  userCreated: one(users, { fields: [licensedAreas.createUserId], references: [users.id] }),
  userUpdated: one(users, { fields: [licensedAreas.updateUserId], references: [users.id] }),
}));

export const areasDataRelations = relations(areasData, ({ one }) => ({
  area: one(licensedAreas, { fields: [areasData.areaId], references: [licensedAreas.id] }),
  userCreated: one(users, { fields: [areasData.createUserId], references: [users.id] }),
  userUpdated: one(users, { fields: [areasData.updateUserId], references: [users.id] }),
}));

export const fieldsMapsRelations = relations(fieldsMaps, ({ one, many }) => ({
  field: one(fields, { fields: [fieldsMaps.fieldId], references: [fields.id] }),
  file: one(files, { fields: [fieldsMaps.fileId], references: [files.id] }),
  polygons: many(fieldMapPolygons),
  userCreated: one(users, { fields: [fieldsMaps.createUserId], references: [users.id] }),
  userUpdated: one(users, { fields: [fieldsMaps.updateUserId], references: [users.id] }),
}))

export const fieldMapPolygonsRelations = relations(fieldMapPolygons, ({ one }) => ({
  fieldMap: one(fieldsMaps, { fields: [fieldMapPolygons.fieldMapId], references: [fieldsMaps.id] }),
  area: one(licensedAreas, { fields: [fieldMapPolygons.areaId], references: [licensedAreas.id] }),
  userCreated: one(users, { fields: [fieldMapPolygons.createUserId], references: [users.id] }),
  userUpdated: one(users, { fields: [fieldMapPolygons.updateUserId], references: [users.id] }),
}))

export const filesRelations = relations(files, ({ one }) => ({
  mapData: one(mapData),
  fieldMap: one(fieldsMaps),
  userCreated: one(users, { fields: [files.createUserId], references: [users.id] }),
  userUpdated: one(users, { fields: [files.updateUserId], references: [users.id] }),
}))