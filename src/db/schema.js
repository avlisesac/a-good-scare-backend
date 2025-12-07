import { pgTable, varchar, uuid } from "drizzle-orm/pg-core";
export const usersTable = pgTable("users", {
    id: uuid().primaryKey().defaultRandom().notNull().unique(),
    email: varchar({ length: 255 }).notNull().unique(),
});
//# sourceMappingURL=schema.js.map