import {
  pgTable,
  varchar,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

const datetimeTableProperties = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp(),
};

const defaultTableProperties = {
  id: uuid().primaryKey().defaultRandom().notNull(),
  ...datetimeTableProperties,
};

export const users = pgTable("users", {
  ...defaultTableProperties,
  email: varchar({ length: 255 }).notNull().unique(),
  password: text().notNull(),
});

export const movies = pgTable("movies", {
  ...defaultTableProperties,
  id: integer().notNull().unique(),
  averageRating: integer(),
  totalRatings: integer(),
  totalReviews: integer(),
});

export const ratingEnum = pgEnum("rating", ["pos", "neg"]);

export const ratings = pgTable(
  "ratings",
  {
    ...defaultTableProperties,
    movieId: integer("movie_id").references(() => movies.id),
    userId: uuid("user_id").references(() => users.id),
    rating: ratingEnum(),
  },
  (table) => [
    index("rating_movie_idx").on(table.movieId),
    index("rating_user_idx").on(table.userId),
    uniqueIndex("rating_movie_user_idx").on(table.movieId, table.userId),
  ]
);

export const reviews = pgTable(
  "reviews",
  {
    ...defaultTableProperties,
    movieId: integer("movie_id").references(() => movies.id),
    userId: uuid("user_id").references(() => users.id),
    review: text(),
    reviewContainsSpoiler: boolean(),
  },
  (table) => [
    index("review_movie_idx").on(table.movieId),
    index("review_user_idx").on(table.userId),
    uniqueIndex("review_movie_user_idx").on(table.movieId, table.userId),
  ]
);

export const wantToWatch = pgTable(
  "wantToWatch",
  {
    ...defaultTableProperties,
    movieId: integer("movie_id").references(() => movies.id),
    userId: uuid("user_id").references(() => users.id),
    toWatch: boolean(),
  },
  (table) => [
    index("wtw_movie_idx").on(table.movieId),
    index("wtw_user_idx").on(table.userId),
    uniqueIndex("wtw_movie_user_idx").on(table.movieId, table.userId),
  ]
);

export const flaggedAsNotHorror = pgTable(
  "flaggedAsNotHorror",
  {
    ...defaultTableProperties,
    movieId: integer("movie_id").references(() => movies.id),
    userId: uuid("user_id").references(() => users.id),
  },
  (table) => [
    index("nhflag_movie_idx").on(table.movieId),
    index("nhflag_user_idx").on(table.userId),
    uniqueIndex("nhflag_movie_user_idx").on(table.movieId, table.userId),
  ]
);

export const seenMovies = pgTable(
  "seenMovies",
  {
    ...defaultTableProperties,
    movieId: integer("movie_id").references(() => movies.id),
    userId: uuid("user_id").references(() => users.id),
  },
  (table) => [
    index("seen_movie_idx").on(table.movieId),
    index("seen_user_idx").on(table.userId),
    uniqueIndex("seen_movie_user_idx").on(table.movieId, table.userId),
  ]
);
