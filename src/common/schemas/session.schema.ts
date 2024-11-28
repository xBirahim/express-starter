import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";
import { User } from "./user.schema";
import { sql } from "drizzle-orm";

export const Session = pgTable("session", {
    id: uuid("id")
        .$default(() => uuidv4())
        .primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => User.id),
    createdAt: timestamp("created_at", {
        withTimezone: true,
        mode: "date",
    })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull()
        .defaultNow(),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date",
    }).notNull(),
    lastActivityAt: timestamp("last_activity_at", {
        withTimezone: true,
        mode: "date",
    })
        .notNull()
        .defaultNow(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    isValid: boolean("is_valid").notNull().default(true),
});
