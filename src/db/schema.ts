import { pgTable, varchar, uuid, text, date, timestamp } from "drizzle-orm/pg-core";

const defaultTableProperties = {
  id: uuid().primaryKey().defaultRandom().notNull().unique(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp()
}

export const usersTable = pgTable("users", {
  ...defaultTableProperties,
  email: varchar({ length: 255 }).notNull().unique(),
  password: text().notNull(),
});
