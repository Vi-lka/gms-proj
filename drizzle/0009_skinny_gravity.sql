ALTER TABLE "gms_proj_field-map-polygons" ADD COLUMN "create_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_field-map-polygons" ADD COLUMN "update_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_field-map-polygons" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_field-map-polygons" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_fields-maps" ADD COLUMN "create_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_fields-maps" ADD COLUMN "update_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_fields-maps" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_fields-maps" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_areas_data" ADD COLUMN "create_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_areas_data" ADD COLUMN "update_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_areas_data" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_areas_data" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_fields" ADD COLUMN "create_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_fields" ADD COLUMN "update_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_fields" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_fields" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_licensed_areas" ADD COLUMN "create_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_licensed_areas" ADD COLUMN "update_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_licensed_areas" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_licensed_areas" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_files" ADD COLUMN "create_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_files" ADD COLUMN "update_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_files" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_files" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_clusters" ADD COLUMN "create_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_clusters" ADD COLUMN "update_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_clusters" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_clusters" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_companies" ADD COLUMN "create_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_companies" ADD COLUMN "update_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_companies" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_companies" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_companies_to_map_items" ADD COLUMN "create_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_companies_to_map_items" ADD COLUMN "update_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_companies_to_map_items" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_companies_to_map_items" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_map_data" ADD COLUMN "create_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_map_data" ADD COLUMN "update_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_map_data" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_map_data" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_map_items" ADD COLUMN "create_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_map_items" ADD COLUMN "update_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_map_items" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_map_items" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_profitability" ADD COLUMN "create_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_profitability" ADD COLUMN "update_user_id" varchar(255);--> statement-breakpoint
ALTER TABLE "gms_proj_profitability" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_profitability" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "gms_proj_field-map-polygons" ADD CONSTRAINT "gms_proj_field-map-polygons_create_user_id_gms_proj_user_id_fk" FOREIGN KEY ("create_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_field-map-polygons" ADD CONSTRAINT "gms_proj_field-map-polygons_update_user_id_gms_proj_user_id_fk" FOREIGN KEY ("update_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_fields-maps" ADD CONSTRAINT "gms_proj_fields-maps_create_user_id_gms_proj_user_id_fk" FOREIGN KEY ("create_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_fields-maps" ADD CONSTRAINT "gms_proj_fields-maps_update_user_id_gms_proj_user_id_fk" FOREIGN KEY ("update_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_areas_data" ADD CONSTRAINT "gms_proj_areas_data_create_user_id_gms_proj_user_id_fk" FOREIGN KEY ("create_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_areas_data" ADD CONSTRAINT "gms_proj_areas_data_update_user_id_gms_proj_user_id_fk" FOREIGN KEY ("update_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_fields" ADD CONSTRAINT "gms_proj_fields_create_user_id_gms_proj_user_id_fk" FOREIGN KEY ("create_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_fields" ADD CONSTRAINT "gms_proj_fields_update_user_id_gms_proj_user_id_fk" FOREIGN KEY ("update_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_licensed_areas" ADD CONSTRAINT "gms_proj_licensed_areas_create_user_id_gms_proj_user_id_fk" FOREIGN KEY ("create_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_licensed_areas" ADD CONSTRAINT "gms_proj_licensed_areas_update_user_id_gms_proj_user_id_fk" FOREIGN KEY ("update_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_files" ADD CONSTRAINT "gms_proj_files_create_user_id_gms_proj_user_id_fk" FOREIGN KEY ("create_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_files" ADD CONSTRAINT "gms_proj_files_update_user_id_gms_proj_user_id_fk" FOREIGN KEY ("update_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_clusters" ADD CONSTRAINT "gms_proj_clusters_create_user_id_gms_proj_user_id_fk" FOREIGN KEY ("create_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_clusters" ADD CONSTRAINT "gms_proj_clusters_update_user_id_gms_proj_user_id_fk" FOREIGN KEY ("update_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_companies" ADD CONSTRAINT "gms_proj_companies_create_user_id_gms_proj_user_id_fk" FOREIGN KEY ("create_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_companies" ADD CONSTRAINT "gms_proj_companies_update_user_id_gms_proj_user_id_fk" FOREIGN KEY ("update_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_companies_to_map_items" ADD CONSTRAINT "gms_proj_companies_to_map_items_create_user_id_gms_proj_user_id_fk" FOREIGN KEY ("create_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_companies_to_map_items" ADD CONSTRAINT "gms_proj_companies_to_map_items_update_user_id_gms_proj_user_id_fk" FOREIGN KEY ("update_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_map_data" ADD CONSTRAINT "gms_proj_map_data_create_user_id_gms_proj_user_id_fk" FOREIGN KEY ("create_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_map_data" ADD CONSTRAINT "gms_proj_map_data_update_user_id_gms_proj_user_id_fk" FOREIGN KEY ("update_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_map_items" ADD CONSTRAINT "gms_proj_map_items_create_user_id_gms_proj_user_id_fk" FOREIGN KEY ("create_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_map_items" ADD CONSTRAINT "gms_proj_map_items_update_user_id_gms_proj_user_id_fk" FOREIGN KEY ("update_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_profitability" ADD CONSTRAINT "gms_proj_profitability_create_user_id_gms_proj_user_id_fk" FOREIGN KEY ("create_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_profitability" ADD CONSTRAINT "gms_proj_profitability_update_user_id_gms_proj_user_id_fk" FOREIGN KEY ("update_user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE set null ON UPDATE no action;