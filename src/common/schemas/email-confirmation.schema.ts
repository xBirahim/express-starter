import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";
import { User } from "./user.schema";

export const EmailConfirmation = pgTable("emailConfirmation", {
    id: uuid("id")
        .$default(() => uuidv4())
        .primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => User.id),
    token: text("token").notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
        mode: "date",
    })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date",
    }).notNull(),
    confirmedAt: timestamp("confirmed_at", {
        withTimezone: true,
        mode: "date",
    }),
});
