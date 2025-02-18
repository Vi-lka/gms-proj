import { index, varchar } from "drizzle-orm/pg-core";
import createTable from "./createTable";
import { type Field, fields, type LicensedArea, licensedAreas } from "./fields";
import { type Company } from "./map";
import { numericCasted } from "../utils";

export const fieldsMaps = createTable(
  "fields-maps",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    url: varchar("url", { length: 255 }).notNull(),
    fieldId: varchar("field_id", { length: 255 })
      .references(() => fields.id, {onDelete: 'cascade'}).notNull(),
  },
  (fieldMap) => ({
    nameIndex: index("field_map_name_idx").on(fieldMap.name),
    urlIndex: index("field_map_url_idx").on(fieldMap.url),
  })
)

export const fieldMapPoints = createTable(
  "field-map-points",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    fieldMapId: varchar("field_map_id", { length: 255 })
      .references(() => fieldsMaps.id, {onDelete: 'cascade'}).notNull(),
    areaId: varchar("area_id", { length: 255 })
      .references(() => licensedAreas.id, {onDelete: 'cascade'}).notNull(),
    points: numericCasted("points", { precision: 100, scale: 20 }).array().notNull(),
  }
)

export type FieldMap = typeof fieldsMaps.$inferSelect
export type FieldMapPoints = typeof fieldMapPoints.$inferSelect

export interface FieldMapExtend extends FieldMap {
  fieldId: Field["id"],
  fieldName: Field["name"],
  companyId: Company["id"],
  companyName: Company["name"],
}
export interface FieldMapPointsExtend extends FieldMapPoints {
  areaName: LicensedArea["name"],
}