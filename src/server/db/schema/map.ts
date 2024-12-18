import { boolean, customType, index, text, varchar } from "drizzle-orm/pg-core";
import createTable from "./createTable";
import { relations } from "drizzle-orm";

export type NumericConfig = {
	precision?: number
	scale?: number
}

export const numericCasted = customType<{
	data: number
	driverData: string
	config: NumericConfig
}>({
	dataType: (config) => {
		if (config?.precision && config?.scale) {
			return `numeric(${config.precision}, ${config.scale})`
		}
		return 'numeric'
	},
	fromDriver: (value: string) => Number.parseFloat(value), // note: precision loss for very large/small digits so area to refactor if needed
	toDriver: (value: number) => value.toString(),
})

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
export const clustersRelations = relations(clusters, ({ many }) => ({
  companies: many(companies)
}));

export const companies = createTable(
  "companies",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    clusterId: varchar("clusters_id", { length: 255 })
      .references(() => clusters.id),
    mapItemId: varchar("map_item_id", { length: 255 })
      .references(() => mapItems.id)
  },
  (company) => ({
    nameIndex: index("company_name_idx").on(company.name),
  })
);
export const companiesRelations = relations(companies, ({ one }) => ({
  cluster: one(clusters, { fields: [companies.clusterId], references: [clusters.id] }),
  mapItem: one(mapItems, { fields: [companies.mapItemId], references: [mapItems.id] }),
}));

export const mapItems = createTable(
  "map_items",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    description: text("description"),
    clusterId: varchar("clusters_id", { length: 255 })
      .references(() => clusters.id),
    xPos: numericCasted("x_pos", { precision: 100, scale: 20 }).notNull(),
    yPos: numericCasted("y_pos", { precision: 100, scale: 20 }).notNull(),
  }
);
export const mapItemsRelations = relations(mapItems, ({ one, many }) => ({
  cluster: one(clusters, { fields: [mapItems.clusterId], references: [clusters.id] }),
  companies: many(companies),
}));

// Types
export type MapData = typeof mapData.$inferSelect
export type MapItem = typeof mapItems.$inferSelect
export type Company = typeof companies.$inferSelect
export type Cluster = typeof clusters.$inferSelect