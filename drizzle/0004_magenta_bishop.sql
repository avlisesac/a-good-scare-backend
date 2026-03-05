ALTER TABLE "list_items" RENAME COLUMN "list_item" TO "list_id";--> statement-breakpoint
ALTER TABLE "list_items" DROP CONSTRAINT "list_items_list_item_lists_id_fk";
--> statement-breakpoint
DROP INDEX "list_item_movie_list_idx";--> statement-breakpoint
ALTER TABLE "list_items" ADD CONSTRAINT "list_items_list_id_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."lists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "list_item_movie_list_idx" ON "list_items" USING btree ("movie_id","list_id");