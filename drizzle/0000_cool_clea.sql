CREATE TYPE "public"."rating" AS ENUM('pos', 'neg');--> statement-breakpoint
CREATE TABLE "flaggedAsNotHorror" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"movie_id" integer,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "movies" (
	"id" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"averageRating" integer,
	"totalRatings" integer,
	"totalReviews" integer,
	CONSTRAINT "movies_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"movie_id" integer,
	"user_id" uuid,
	"rating" "rating"
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"movie_id" integer,
	"user_id" uuid,
	"review" text,
	"reviewContainsSpoiler" boolean
);
--> statement-breakpoint
CREATE TABLE "seenMovies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"movie_id" integer,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wantToWatch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"movie_id" integer,
	"user_id" uuid,
	"toWatch" boolean
);
--> statement-breakpoint
ALTER TABLE "flaggedAsNotHorror" ADD CONSTRAINT "flaggedAsNotHorror_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flaggedAsNotHorror" ADD CONSTRAINT "flaggedAsNotHorror_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seenMovies" ADD CONSTRAINT "seenMovies_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seenMovies" ADD CONSTRAINT "seenMovies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wantToWatch" ADD CONSTRAINT "wantToWatch_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wantToWatch" ADD CONSTRAINT "wantToWatch_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "nhflag_movie_idx" ON "flaggedAsNotHorror" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "nhflag_user_idx" ON "flaggedAsNotHorror" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "nhflag_movie_user_idx" ON "flaggedAsNotHorror" USING btree ("movie_id","user_id");--> statement-breakpoint
CREATE INDEX "rating_movie_idx" ON "ratings" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "rating_user_idx" ON "ratings" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rating_movie_user_idx" ON "ratings" USING btree ("movie_id","user_id");--> statement-breakpoint
CREATE INDEX "review_movie_idx" ON "reviews" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "review_user_idx" ON "reviews" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "review_movie_user_idx" ON "reviews" USING btree ("movie_id","user_id");--> statement-breakpoint
CREATE INDEX "seen_movie_idx" ON "seenMovies" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "seen_user_idx" ON "seenMovies" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "seen_movie_user_idx" ON "seenMovies" USING btree ("movie_id","user_id");--> statement-breakpoint
CREATE INDEX "wtw_movie_idx" ON "wantToWatch" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "wtw_user_idx" ON "wantToWatch" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wtw_movie_user_idx" ON "wantToWatch" USING btree ("movie_id","user_id");