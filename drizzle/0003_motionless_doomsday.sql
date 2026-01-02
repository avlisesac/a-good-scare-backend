ALTER TABLE "movies_to_users" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "movies_to_users" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "movies_to_users" ADD COLUMN "deletedAt" timestamp;