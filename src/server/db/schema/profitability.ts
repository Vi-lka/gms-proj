import { timestamp, varchar } from "drizzle-orm/pg-core";
import createTable from "./createTable";
import { numericCasted } from "../utils";
import { type User, users } from "./auth";

export const profitability = createTable(
  "profitability",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    lithium: numericCasted("lithium", { precision: 100, scale: 20 }),
    rubidium: numericCasted("rubidium", { precision: 100, scale: 20 }),
    cesium: numericCasted("cesium", { precision: 100, scale: 20 }),
    boron: numericCasted("boron", { precision: 100, scale: 20 }),
    iodine: numericCasted("iodine", { precision: 100, scale: 20 }),
    sodium: numericCasted("sodium", { precision: 100, scale: 20 }),
    calcium: numericCasted("calcium", { precision: 100, scale: 20 }),
    magnesium: numericCasted("magnesium", { precision: 100, scale: 20 }),
    potassium: numericCasted("potassium", { precision: 100, scale: 20 }),
    chlorine: numericCasted("chlorine", { precision: 100, scale: 20 }),
    bromine: numericCasted("bromine", { precision: 100, scale: 20 }),
    strontium: numericCasted("strontium", { precision: 100, scale: 20 }),
    barium: numericCasted("barium", { precision: 100, scale: 20 }),
    aluminum: numericCasted("aluminum", { precision: 100, scale: 20 }),
    selenium: numericCasted("selenium", { precision: 100, scale: 20 }),
    silicon: numericCasted("silicon", { precision: 100, scale: 20 }),
    manganese: numericCasted("manganese", { precision: 100, scale: 20 }),
    copper: numericCasted("copper", { precision: 100, scale: 20 }),
    zinc: numericCasted("zinc", { precision: 100, scale: 20 }),
    silver: numericCasted("silver", { precision: 100, scale: 20 }),
    tungsten: numericCasted("tungsten", { precision: 100, scale: 20 }),
    titanium: numericCasted("titanium", { precision: 100, scale: 20 }),
    vanadium: numericCasted("vanadium", { precision: 100, scale: 20 }),
    chromium: numericCasted("chromium", { precision: 100, scale: 20 }),
    cobalt: numericCasted("cobalt", { precision: 100, scale: 20 }),
    nickel: numericCasted("nickel", { precision: 100, scale: 20 }),
    arsenic: numericCasted("arsenic", { precision: 100, scale: 20 }),
    molybdenum: numericCasted("molybdenum", { precision: 100, scale: 20 }),
    plumbum: numericCasted("plumbum", { precision: 100, scale: 20 }),
    bismuth: numericCasted("bismuth", { precision: 100, scale: 20 }),
    sulfateIon: numericCasted("sulfateIon", { precision: 100, scale: 20 }),
    bicarbonate: numericCasted("bicarbonate", { precision: 100, scale: 20 }),
    carbonateIon: numericCasted("carbonateIon", { precision: 100, scale: 20 }),
    ammonium: numericCasted("ammonium", { precision: 100, scale: 20 }),
    fluorine: numericCasted("fluorine", { precision: 100, scale: 20 }),
    nitrogenDioxide: numericCasted("nitrogenDioxide", { precision: 100, scale: 20 }),
    nitrate: numericCasted("nitrate", { precision: 100, scale: 20 }),
    phosphate: numericCasted("phosphate", { precision: 100, scale: 20 }),
    ferrum: numericCasted("ferrum", { precision: 100, scale: 20 }),
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

export type Profitability = typeof profitability.$inferSelect & {
  createUserName: User["name"],
  updateUserName: User["name"],
}