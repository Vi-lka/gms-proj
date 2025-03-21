import { index, timestamp, varchar } from "drizzle-orm/pg-core";
import createTable from "./createTable";
import { numericCasted } from "../utils";
import { users } from "./auth";

export const files = createTable(
  "files", 
  {
    id: varchar("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    bucket: varchar("bucket", { length: 255 }).notNull(),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    size: numericCasted("size", { precision: 100, scale: 20 }).notNull(),
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
  (file) => ({
    fileNameIndex: index("file_name_idx").on(file.fileName),
    originalNameIndex: index("original_name_idx").on(file.originalName),
  })
)

// Types
export type FileDB = typeof files.$inferSelect & {
  createUserName?: string | null;
  updateUserName?: string | null;
}

export type FileDBExtend = FileDB & {
  fieldMapId?: string;
  fieldMapName?: string;
}