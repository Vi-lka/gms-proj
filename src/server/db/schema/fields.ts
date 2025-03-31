import { date, index, pgEnum, text, timestamp, varchar } from "drizzle-orm/pg-core";
import createTable from "./createTable";
import { companies, mapItems, type Company } from "./map";
import { numericCasted } from "../utils";
import { type User, users } from "./auth";

export const fields = createTable(
  "fields",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    companyId: varchar("company_id", { length: 255 })
      .references(() => companies.id, {onDelete: 'cascade'}).notNull(),
    mapItemId: varchar("map_item_id", { length: 255 })
      .references(() => mapItems.id, {onDelete: 'set null'}),
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
  (field) => ({
    nameIndex: index("field_name_idx").on(field.name),
  })
)

export const licensedAreas = createTable(
  "licensed_areas",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    fieldId: varchar("field_id", { length: 255 })
      .references(() => fields.id, {onDelete: 'cascade'}).notNull(),
    createUserId: varchar("create_user_id", { length: 255 })
      .references(() => users.id, { onDelete: "set null" }),
    updateUserId: varchar("update_user_id", { length: 255 })
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow().$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (licensedArea) => ({
    nameIndex: index("licensed_area_name_idx").on(licensedArea.name),
  })
)

export const approxEnum = pgEnum('approx', ['>', '<']);

export const areasData = createTable(
  "areas_data",
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    areaId: varchar("area_id", { length: 255 })
      .references(() => licensedAreas.id, {onDelete: 'cascade'}).notNull(),
    bush: text("bush"),
    hole: text("hole"),
    plast: text("plast"),
    horizon: text("horizon"),
    retinue: text("retinue"),
    occurrenceIntervalStart: numericCasted("occurrence_interval_start", { precision: 100, scale: 20 }),
    occurrenceIntervalEnd: numericCasted("occurrence_interval_end", { precision: 100, scale: 20 }),
    samplingDate: date("sampling_date", {mode: "date"}),
    analysisDate: date("analysis_date", {mode: "date"}),
    protocol: text("protocol"),
    protocolUrl: text("protocol_url"),
    sampleCode: text("sample_code"),
    pHydrogen: numericCasted("p_hydrogen", { precision: 100, scale: 20 }),
    density: numericCasted("density", { precision: 100, scale: 20 }),
    mineralization: numericCasted("mineralization", { precision: 100, scale: 20 }),
    // START: elements...
    lithium: numericCasted("lithium", { precision: 100, scale: 20 }),
    lithiumApprox: approxEnum("lithium_approx"),
    rubidium: numericCasted("rubidium", { precision: 100, scale: 20 }),
    rubidiumApprox: approxEnum("rubidium_approx"),
    cesium: numericCasted("cesium", { precision: 100, scale: 20 }),
    cesiumApprox: approxEnum("cesium_approx"),
    boron: numericCasted("boron", { precision: 100, scale: 20 }),
    boronApprox: approxEnum("boron_approx"),
    iodine: numericCasted("iodine", { precision: 100, scale: 20 }),
    iodineApprox: approxEnum("iodine_approx"),
    sodium: numericCasted("sodium", { precision: 100, scale: 20 }),
    sodiumApprox: approxEnum("sodium_approx"),
    calcium: numericCasted("calcium", { precision: 100, scale: 20 }),
    calciumApprox: approxEnum("calcium_approx"),
    magnesium: numericCasted("magnesium", { precision: 100, scale: 20 }),
    magnesiumApprox: approxEnum("magnesium_approx"),
    potassium: numericCasted("potassium", { precision: 100, scale: 20 }),
    potassiumApprox: approxEnum("potassium_approx"),
    chlorine: numericCasted("chlorine", { precision: 100, scale: 20 }),
    chlorineApprox: approxEnum("chlorine_approx"),
    bromine: numericCasted("bromine", { precision: 100, scale: 20 }),
    bromineApprox: approxEnum("bromine_approx"),
    strontium: numericCasted("strontium", { precision: 100, scale: 20 }),
    strontiumApprox: approxEnum("strontium_approx"),
    barium: numericCasted("barium", { precision: 100, scale: 20 }),
    bariumApprox: approxEnum("barium_approx"),
    aluminum: numericCasted("aluminum", { precision: 100, scale: 20 }),
    aluminumApprox: approxEnum("aluminum_approx"),
    selenium: numericCasted("selenium", { precision: 100, scale: 20 }),
    seleniumApprox: approxEnum("selenium_approx"),
    silicon: numericCasted("silicon", { precision: 100, scale: 20 }),
    siliconApprox: approxEnum("silicon_approx"),
    manganese: numericCasted("manganese", { precision: 100, scale: 20 }),
    manganeseApprox: approxEnum("manganese_approx"),
    copper: numericCasted("copper", { precision: 100, scale: 20 }),
    copperApprox: approxEnum("copper_approx"),
    zinc: numericCasted("zinc", { precision: 100, scale: 20 }),
    zincApprox: approxEnum("zinc_approx"),
    silver: numericCasted("silver", { precision: 100, scale: 20 }),
    silverApprox: approxEnum("silver_approx"),
    tungsten: numericCasted("tungsten", { precision: 100, scale: 20 }),
    tungstenApprox: approxEnum("tungsten_approx"),
    titanium: numericCasted("titanium", { precision: 100, scale: 20 }),
    titaniumApprox: approxEnum("titanium_approx"),
    vanadium: numericCasted("vanadium", { precision: 100, scale: 20 }),
    vanadiumApprox: approxEnum("vanadium_approx"),
    chromium: numericCasted("chromium", { precision: 100, scale: 20 }),
    chromiumApprox: approxEnum("chromium_approx"),
    cobalt: numericCasted("cobalt", { precision: 100, scale: 20 }),
    cobaltApprox: approxEnum("cobalt_approx"),
    nickel: numericCasted("nickel", { precision: 100, scale: 20 }),
    nickelApprox: approxEnum("nickel_approx"),
    arsenic: numericCasted("arsenic", { precision: 100, scale: 20 }),
    arsenicApprox: approxEnum("arsenic_approx"),
    molybdenum: numericCasted("molybdenum", { precision: 100, scale: 20 }),
    molybdenumApprox: approxEnum("molybdenum_approx"),
    plumbum: numericCasted("plumbum", { precision: 100, scale: 20 }),
    plumbumApprox: approxEnum("plumbum_approx"),
    bismuth: numericCasted("bismuth", { precision: 100, scale: 20 }),
    bismuthApprox: approxEnum("bismuth_approx"),
    sulfateIon: numericCasted("sulfate_ion", { precision: 100, scale: 20 }),
    sulfateIonApprox: approxEnum("sulfate_ion_approx"),
    bicarbonate: numericCasted("bicarbonate", { precision: 100, scale: 20 }),
    bicarbonateApprox: approxEnum("bicarbonate_approx"),
    carbonateIon: numericCasted("carbonate_ion", { precision: 100, scale: 20 }),
    carbonateIonApprox: approxEnum("carbonate_ion_approx"),
    ammonium: numericCasted("ammonium", { precision: 100, scale: 20 }),
    ammoniumApprox: approxEnum("ammonium_approx"),
    fluorine: numericCasted("fluorine", { precision: 100, scale: 20 }),
    fluorineApprox: approxEnum("fluorine_approx"),
    nitrogenDioxide: numericCasted("nitrogen_dioxide", { precision: 100, scale: 20 }),
    nitrogenDioxideApprox: approxEnum("nitrogen_dioxide_approx"),
    nitrate: numericCasted("nitrate", { precision: 100, scale: 20 }),
    nitrateApprox: approxEnum("nitrate_approx"),
    phosphate: numericCasted("phosphate", { precision: 100, scale: 20 }),
    phosphateApprox: approxEnum("phosphate_approx"),
    ferrum: numericCasted("ferrum", { precision: 100, scale: 20 }),
    ferrumApprox: approxEnum("ferrum_approx"),
    // END: elements...
    rigidity: numericCasted("rigidity", { precision: 100, scale: 20 }),
    alkalinity: numericCasted("alkalinity", { precision: 100, scale: 20 }),
    electricalConductivity: numericCasted("electrical_conductivity", { precision: 100, scale: 20 }),
    suspendedSolids: numericCasted("suspended_solids", { precision: 100, scale: 20 }),
    dryResidue: numericCasted("dry_residue", { precision: 100, scale: 20 }),
    analysisPlace: text("analysis_place"),
    note: text("note"),
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
  (areaData) => ({
    bushIndex: index("areas_data_bush_idx").on(areaData.bush),
    holeIndex: index("areas_data_hole_idx").on(areaData.hole),
    plastIndex: index("areas_data_plast_idx").on(areaData.plast),
    horizonIndex: index("areas_data_horizon_idx").on(areaData.horizon),
    retinueIndex: index("areas_data_retinue_idx").on(areaData.retinue),
    protocolIndex: index("areas_data_protocol_idx").on(areaData.protocol),
    sampleCodeIndex: index("areas_data_sample_code_idx").on(areaData.sampleCode),
    analysisPlaceIndex: index("areas_data_analysis_place_inx").on(areaData.analysisPlace),
  })
)

// Types
export type Field = typeof fields.$inferSelect
export type LicensedArea = typeof licensedAreas.$inferSelect
export type AreaData = typeof areasData.$inferSelect

export interface LicensedAreaExtend extends LicensedArea {
  createUserName: User["name"],
  updateUserName: User["name"],
  fieldName: Field["name"],
  companyId: Company["id"],
  companyName: Company["name"],
}
export interface FieldExtend extends Field {
  createUserName: User["name"],
  updateUserName: User["name"],
  companyName: Company["name"]
}
export interface FieldWithLicensedAreas extends Field {
  licensedAreas: LicensedArea[]
}
export interface AreaDataExtend extends AreaData {
  createUserName: User["name"],
  updateUserName: User["name"],
  areaName: LicensedArea["name"],
  fieldId: Field["id"],
  fieldName: Field["name"],
  companyId: Company["id"],
  companyName: Company["name"],
  occurrenceInterval: string | null
}