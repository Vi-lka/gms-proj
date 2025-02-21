import { index, varchar } from "drizzle-orm/pg-core";
import createTable from "./createTable";
import { numericCasted } from "../utils";

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
  },
  (file) => ({
    fileNameIndex: index("file_name_idx").on(file.fileName),
    originalNameIndex: index("original_name_idx").on(file.originalName),
  })
)