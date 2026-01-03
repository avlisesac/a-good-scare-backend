import {
  pgTable,
  varchar,
  uuid,
  text,
  timestamp,
  integer,
  primaryKey,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

const datetimeTableProperties = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp(),
};

const defaultTableProperties = {
  id: uuid().primaryKey().defaultRandom().notNull().unique(),
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

export const moviesToUsers = pgTable(
  "movies_to_users",
  {
    ...datetimeTableProperties,
    movieId: integer("movie_id").references(() => movies.id),
    userId: uuid("user_id").references(() => users.id),
    wantToWatch: boolean(),
    seen: boolean(),
    rating: ratingEnum(),
    review: text(),
    reviewContainsSpoiler: boolean(),
    flaggedAsNotHorror: boolean(),
  },
  (table) => [primaryKey({ columns: [table.movieId, table.userId] })]
);
