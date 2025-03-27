ALTER TABLE "gms_proj_user" ALTER COLUMN "guest_until" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "gms_proj_map_data" ADD COLUMN "file_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_map_data" ADD CONSTRAINT "gms_proj_map_data_file_id_gms_proj_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."gms_proj_files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_map_data" DROP COLUMN "svg_url";