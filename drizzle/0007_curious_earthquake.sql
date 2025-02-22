ALTER TABLE "gms_proj_field-map-points" RENAME TO "gms_proj_field-map-polygons";--> statement-breakpoint
ALTER TABLE "gms_proj_field-map-polygons" DROP CONSTRAINT "gms_proj_field-map-points_field_map_id_gms_proj_fields-maps_id_fk";
--> statement-breakpoint
ALTER TABLE "gms_proj_field-map-polygons" DROP CONSTRAINT "gms_proj_field-map-points_area_id_gms_proj_licensed_areas_id_fk";
--> statement-breakpoint
ALTER TABLE "gms_proj_field-map-polygons" ADD CONSTRAINT "gms_proj_field-map-polygons_field_map_id_gms_proj_fields-maps_id_fk" FOREIGN KEY ("field_map_id") REFERENCES "public"."gms_proj_fields-maps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_field-map-polygons" ADD CONSTRAINT "gms_proj_field-map-polygons_area_id_gms_proj_licensed_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."gms_proj_licensed_areas"("id") ON DELETE cascade ON UPDATE no action;