import { boolean, text, varchar } from "drizzle-orm/pg-core";
import createTable from "./createTable";

export const mapData = createTable("map_data", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  svgUrl: text("svg_url"),
  svgWidth: varchar("svg_width", { length: 255 }),
  svgHeight: varchar("svg_height", { length: 255 }),
  selected: boolean("selected").default(false)
})

export const clusters = createTable("clusters", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  image: varchar("image", { length: 255 }),
});

export const curators = createTable("curators", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  shortName: varchar("shortName", { length: 255 }),
})