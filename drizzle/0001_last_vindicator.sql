ALTER TABLE "flaggedAsNotHorror" RENAME TO "flagged_as_not_horror";--> statement-breakpoint
ALTER TABLE "seenMovies" RENAME TO "seen_movies";--> statement-breakpoint
ALTER TABLE "wantToWatch" RENAME TO "want_to_watch";--> statement-breakpoint
ALTER TABLE "flagged_as_not_horror" DROP CONSTRAINT "flaggedAsNotHorror_movie_id_movies_id_fk";
--> statement-breakpoint
ALTER TABLE "flagged_as_not_horror" DROP CONSTRAINT "flaggedAsNotHorror_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "seen_movies" DROP CONSTRAINT "seenMovies_movie_id_movies_id_fk";
--> statement-breakpoint
ALTER TABLE "seen_movies" DROP CONSTRAINT "seenMovies_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "want_to_watch" DROP CONSTRAINT "wantToWatch_movie_id_movies_id_fk";
--> statement-breakpoint
ALTER TABLE "want_to_watch" DROP CONSTRAINT "wantToWatch_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "flagged_as_not_horror" ADD CONSTRAINT "flagged_as_not_horror_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flagged_as_not_horror" ADD CONSTRAINT "flagged_as_not_horror_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seen_movies" ADD CONSTRAINT "seen_movies_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seen_movies" ADD CONSTRAINT "seen_movies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "want_to_watch" ADD CONSTRAINT "want_to_watch_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "want_to_watch" ADD CONSTRAINT "want_to_watch_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;