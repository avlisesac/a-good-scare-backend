CREATE TYPE "public"."rating" AS ENUM('pos', 'neg');--> statement-breakpoint
ALTER TABLE "movies_to_users" ALTER COLUMN "rating" SET DATA TYPE "public"."rating" USING "rating"::"public"."rating";