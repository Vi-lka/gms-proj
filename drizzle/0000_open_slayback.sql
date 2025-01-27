CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."approx" AS ENUM('>', '<');--> statement-breakpoint
CREATE TABLE "gms_proj_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "gms_proj_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "gms_proj_authenticator" (
	"credential_id" text NOT NULL,
	"user_id" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" integer NOT NULL,
	"credential_device_type" text NOT NULL,
	"credential_backed_up" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "gms_proj_authenticator_credential_id_unique" UNIQUE("credential_id")
);
--> statement-breakpoint
CREATE TABLE "gms_proj_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gms_proj_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"role" "role" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gms_proj_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "gms_proj_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "gms_proj_areas_data" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"area_id" varchar(255) NOT NULL,
	"bush" text,
	"hole" text,
	"plast" text,
	"horizon" text,
	"retinue" text,
	"occurrence_interval_start" numeric(100, 20),
	"occurrence_interval_end" numeric(100, 20),
	"sampling_date" date,
	"analysis_date" date,
	"protocol" text,
	"protocol_url" text,
	"sample_code" text,
	"p_hydrogen" numeric(100, 20),
	"density" numeric(100, 20),
	"mineralization" numeric(100, 20),
	"lithium" numeric(100, 20),
	"lithium_approx" "approx",
	"rubidium" numeric(100, 20),
	"rubidium_approx" "approx",
	"cesium" numeric(100, 20),
	"cesium_approx" "approx",
	"boron" numeric(100, 20),
	"boron_approx" "approx",
	"iodine" numeric(100, 20),
	"iodine_approx" "approx",
	"sodium" numeric(100, 20),
	"sodium_approx" "approx",
	"calcium" numeric(100, 20),
	"calcium_approx" "approx",
	"magnesium" numeric(100, 20),
	"magnesium_approx" "approx",
	"potassium" numeric(100, 20),
	"potassium_approx" "approx",
	"chlorine" numeric(100, 20),
	"chlorine_approx" "approx",
	"bromine" numeric(100, 20),
	"bromine_approx" "approx",
	"strontium" numeric(100, 20),
	"strontium_approx" "approx",
	"barium" numeric(100, 20),
	"barium_approx" "approx",
	"aluminum" numeric(100, 20),
	"aluminum_approx" "approx",
	"selenium" numeric(100, 20),
	"selenium_approx" "approx",
	"silicon" numeric(100, 20),
	"silicon_approx" "approx",
	"manganese" numeric(100, 20),
	"manganese_approx" "approx",
	"copper" numeric(100, 20),
	"copper_approx" "approx",
	"zinc" numeric(100, 20),
	"zinc_approx" "approx",
	"silver" numeric(100, 20),
	"silver_approx" "approx",
	"tungsten" numeric(100, 20),
	"tungsten_approx" "approx",
	"titanium" numeric(100, 20),
	"titanium_approx" "approx",
	"vanadium" numeric(100, 20),
	"vanadium_approx" "approx",
	"chromium" numeric(100, 20),
	"chromium_approx" "approx",
	"cobalt" numeric(100, 20),
	"cobalt_approx" "approx",
	"nickel" numeric(100, 20),
	"nickel_approx" "approx",
	"arsenic" numeric(100, 20),
	"arsenic_approx" "approx",
	"molybdenum" numeric(100, 20),
	"molybdenum_approx" "approx",
	"plumbum" numeric(100, 20),
	"plumbum_approx" "approx",
	"bismuth" numeric(100, 20),
	"bismuth_approx" "approx",
	"sulfate_ion" numeric(100, 20),
	"sulfate_ion_approx" "approx",
	"bicarbonate" numeric(100, 20),
	"bicarbonate_approx" "approx",
	"carbonate_ion" numeric(100, 20),
	"carbonate_ion_approx" "approx",
	"ammonium" numeric(100, 20),
	"ammonium_approx" "approx",
	"fluorine" numeric(100, 20),
	"fluorine_approx" "approx",
	"nitrogen_dioxide" numeric(100, 20),
	"nitrogen_dioxide_approx" "approx",
	"nitrate" numeric(100, 20),
	"nitrate_approx" "approx",
	"phosphate" numeric(100, 20),
	"phosphate_approx" "approx",
	"ferrum" numeric(100, 20),
	"ferrum_approx" "approx",
	"rigidity" numeric(100, 20),
	"alkalinity" numeric(100, 20),
	"electrical_conductivity" numeric(100, 20),
	"suspended_solids" numeric(100, 20),
	"dry_residue" numeric(100, 20),
	"analysis_place" text,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "gms_proj_fields" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"company_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gms_proj_licensed_areas" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"field_id" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gms_proj_clusters" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "gms_proj_companies" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "gms_proj_companies_to_map_items" (
	"company_id" varchar(255) NOT NULL,
	"map_item_id" varchar(255) NOT NULL,
	CONSTRAINT "gms_proj_companies_to_map_items_company_id_map_item_id_pk" PRIMARY KEY("company_id","map_item_id")
);
--> statement-breakpoint
CREATE TABLE "gms_proj_map_data" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"svg_url" text NOT NULL,
	"svg_width" varchar(255),
	"svg_height" varchar(255),
	"selected" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "gms_proj_map_items" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"description" text,
	"clusters_id" varchar(255),
	"x_pos" numeric(100, 20) NOT NULL,
	"y_pos" numeric(100, 20) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "gms_proj_account" ADD CONSTRAINT "gms_proj_account_user_id_gms_proj_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_authenticator" ADD CONSTRAINT "gms_proj_authenticator_user_id_gms_proj_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_session" ADD CONSTRAINT "gms_proj_session_user_id_gms_proj_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."gms_proj_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_areas_data" ADD CONSTRAINT "gms_proj_areas_data_area_id_gms_proj_licensed_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."gms_proj_licensed_areas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_fields" ADD CONSTRAINT "gms_proj_fields_company_id_gms_proj_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."gms_proj_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_licensed_areas" ADD CONSTRAINT "gms_proj_licensed_areas_field_id_gms_proj_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."gms_proj_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_companies_to_map_items" ADD CONSTRAINT "gms_proj_companies_to_map_items_company_id_gms_proj_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."gms_proj_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_companies_to_map_items" ADD CONSTRAINT "gms_proj_companies_to_map_items_map_item_id_gms_proj_map_items_id_fk" FOREIGN KEY ("map_item_id") REFERENCES "public"."gms_proj_map_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gms_proj_map_items" ADD CONSTRAINT "gms_proj_map_items_clusters_id_gms_proj_clusters_id_fk" FOREIGN KEY ("clusters_id") REFERENCES "public"."gms_proj_clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "gms_proj_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "gms_proj_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "areas_data_bush_idx" ON "gms_proj_areas_data" USING btree ("bush");--> statement-breakpoint
CREATE INDEX "areas_data_hole_idx" ON "gms_proj_areas_data" USING btree ("hole");--> statement-breakpoint
CREATE INDEX "areas_data_plast_idx" ON "gms_proj_areas_data" USING btree ("plast");--> statement-breakpoint
CREATE INDEX "areas_data_horizon_idx" ON "gms_proj_areas_data" USING btree ("horizon");--> statement-breakpoint
CREATE INDEX "areas_data_retinue_idx" ON "gms_proj_areas_data" USING btree ("retinue");--> statement-breakpoint
CREATE INDEX "areas_data_protocol_idx" ON "gms_proj_areas_data" USING btree ("protocol");--> statement-breakpoint
CREATE INDEX "areas_data_sample_code_idx" ON "gms_proj_areas_data" USING btree ("sample_code");--> statement-breakpoint
CREATE INDEX "areas_data_analysis_place_inx" ON "gms_proj_areas_data" USING btree ("analysis_place");--> statement-breakpoint
CREATE INDEX "field_name_idx" ON "gms_proj_fields" USING btree ("name");--> statement-breakpoint
CREATE INDEX "licensed_area_name_idx" ON "gms_proj_licensed_areas" USING btree ("name");--> statement-breakpoint
CREATE INDEX "cluster_name_idx" ON "gms_proj_clusters" USING btree ("name");--> statement-breakpoint
CREATE INDEX "company_name_idx" ON "gms_proj_companies" USING btree ("name");