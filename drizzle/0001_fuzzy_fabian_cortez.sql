ALTER TYPE "public"."role" ADD VALUE 'unknown' BEFORE 'user';--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'guest' BEFORE 'user';--> statement-breakpoint
ALTER TYPE "public"."role" ADD VALUE 'super-admin';