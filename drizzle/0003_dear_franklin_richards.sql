ALTER TABLE "gms_proj_fields" DROP CONSTRAINT "gms_proj_fields_map_item_id_gms_proj_map_items_id_fk";
--> statement-breakpoint
ALTER TABLE "gms_proj_fields" ADD CONSTRAINT "gms_proj_fields_map_item_id_gms_proj_map_items_id_fk" FOREIGN KEY ("map_item_id") REFERENCES "public"."gms_proj_map_items"("id") ON DELETE set null ON UPDATE no action;