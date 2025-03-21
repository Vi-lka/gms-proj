import { index, timestamp, varchar } from "drizzle-orm/pg-core";
import createTable from "./createTable";
import { type Field, fields, type LicensedArea, licensedAreas } from "./fields";
import { type Company } from "./map";
import { numericCasted } from "../utils";
import { files } from "./files";
import { type User, users } from "./auth";

export const fieldsMaps = createTable(
  "fields-maps",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    fileId: varchar("file_id", { length: 255 })
      .references(() => files.id, {onDelete: 'cascade'}).notNull(),
    fieldId: varchar("field_id", { length: 255 })
      .references(() => fields.id, {onDelete: 'cascade'}).notNull(),
    createUserId: varchar("create_user_id", { length: 255 })
      .references(() => users.id, { onDelete: "set null" }),
    updateUserId: varchar("update_user_id", { length: 255 })
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (fieldMap) => ({
    nameIndex: index("field_map_name_idx").on(fieldMap.name),
  })
)

export const fieldMapPolygons = createTable(
  "field-map-polygons",
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
    createUserId: varchar("create_user_id", { length: 255 })
      .references(() => users.id, { onDelete: "set null" }),
    updateUserId: varchar("update_user_id", { length: 255 })
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow().$onUpdate(() => new Date()).notNull(),
  }
)

export type FieldMap = typeof fieldsMaps.$inferSelect
export type FieldMapPolygons = typeof fieldMapPolygons.$inferSelect

export interface FieldMapExtend extends FieldMap {
  createUserName: User["name"],
  updateUserName: User["name"],
  fieldId: Field["id"],
  fieldName: Field["name"],
  companyId: Company["id"],
  companyName: Company["name"],
}

export type FieldMapWithUrl = FieldMapExtend & {
  fileUrl: string;
}

export interface FieldMapPointsExtend extends FieldMapPolygons {
  areaName: LicensedArea["name"],
}