CREATE TABLE "gms_proj_field-map-points" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"field_map_id" varchar(255) NOT NULL,
	"area_id" varchar(255) NOT NULL,
	"points" numeric(100, 20)[] NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gms_proj_field-map-points" ADD CONSTRAINT "gms_proj_field-map-points_field_map_id_gms_proj_fields-maps_id_fk" FOREIGN KEY ("field_map_id") REFERENCES "public"."gms_proj_fields-maps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_field-map-points" ADD CONSTRAINT "gms_proj_field-map-points_area_id_gms_proj_licensed_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."gms_proj_licensed_areas"("id") ON DELETE cascade ON UPDATE no action;