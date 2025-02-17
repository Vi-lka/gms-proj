CREATE TABLE "gms_proj_fields-maps" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"field_id" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gms_proj_fields-maps" ADD CONSTRAINT "gms_proj_fields-maps_field_id_gms_proj_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."gms_proj_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "field_map_name_idx" ON "gms_proj_fields-maps" USING btree ("name");--> statement-breakpoint
CREATE INDEX "field_map_url_idx" ON "gms_proj_fields-maps" USING btree ("url");