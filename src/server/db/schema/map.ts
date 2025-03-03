import { boolean, index, primaryKey, text, varchar } from "drizzle-orm/pg-core";
import createTable from "./createTable";
import { numericCasted } from "../utils";
import { type FieldWithLicensedAreas, type Field } from "./fields";

export const mapData = createTable("map_data", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  svgUrl: text("svg_url").notNull(),
  svgWidth: varchar("svg_width", { length: 255 }),
  svgHeight: varchar("svg_height", { length: 255 }),
  selected: boolean("selected").default(false)
})

export const clusters = createTable(
  "clusters", 
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
  },
  (cluster) => ({
    nameIndex: index("cluster_name_idx").on(cluster.name),
  })
);

export const companies = createTable(
  "companies",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
  },
  (company) => ({
    nameIndex: index("company_name_idx").on(company.name),
  })
);

export const mapItems = createTable(
  "map_items",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    description: text("description"),
    clusterId: varchar("clusters_id", { length: 255 })
      .references(() => clusters.id, { onDelete: "cascade" }),
    xPos: numericCasted("x_pos", { precision: 100, scale: 20 }).notNull(),
    yPos: numericCasted("y_pos", { precision: 100, scale: 20 }).notNull(),
  }
);

export const companiesToMapItems = createTable(
  'companies_to_map_items',
  {
    companyId: varchar("company_id", { length: 255 })
      .references(() => companies.id, {onDelete: 'cascade'})
      .notNull(),
    mapItemId: varchar('map_item_id', { length: 255 })
      .references(() => mapItems.id, {onDelete: 'cascade'})
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.companyId, t.mapItemId] }),
  }),
);

// Types
export type MapData = typeof mapData.$inferSelect
export type MapItem = typeof mapItems.$inferSelect
export type Company = typeof companies.$inferSelect
export type CompanyExtend = Company & {
  fields: Field[]
}
export type CompanyWithListedAreas = Company & {
  fields: FieldWithLicensedAreas[]
}
export type Cluster = typeof clusters.$inferSelect

