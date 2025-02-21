CREATE TABLE "gms_proj_files" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"bucket" varchar(255) NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"original_name" varchar(255) NOT NULL,
	"size" numeric(100, 20) NOT NULL
);
--> statement-breakpoint
DROP INDEX "field_map_url_idx";--> statement-breakpoint
ALTER TABLE "gms_proj_fields-maps" ADD COLUMN "file_id" varchar(255) NOT NULL;--> statement-breakpoint
CREATE INDEX "file_name_idx" ON "gms_proj_files" USING btree ("file_name");--> statement-breakpoint
CREATE INDEX "original_name_idx" ON "gms_proj_files" USING btree ("original_name");--> statement-breakpoint
ALTER TABLE "gms_proj_fields-maps" ADD CONSTRAINT "gms_proj_fields-maps_file_id_gms_proj_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."gms_proj_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_fields-maps" DROP COLUMN "url";