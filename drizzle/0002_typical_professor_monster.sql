CREATE TYPE "public"."rating" AS ENUM('pos', 'neg');--> statement-breakpoint
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
CREATE TABLE "movies_to_users" (
	"movie_id" integer,
	"user_id" uuid,
	"wantToWatch" boolean,
	"seen" boolean,
	"rating" "rating",
	"review" text,
	"reviewContainsSpoiler" boolean,
	"flaggedAsNotHorror" boolean,
	CONSTRAINT "movies_to_users_movie_id_user_id_pk" PRIMARY KEY("movie_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "movies_to_users" ADD CONSTRAINT "movies_to_users_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movies_to_users" ADD CONSTRAINT "movies_to_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;