import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";
import { Session } from "./session.schema";
import { sql } from "drizzle-orm";

export const RefreshToken = pgTable("refreshToken", {
    id: uuid("id")
        .$default(() => uuidv4())
        .primaryKey(),
    token: text("token").notNull(),
    sessionId: uuid("session_id")
        .notNull()
        .references(() => Session.id),
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
    revoked: boolean("revoked").notNull(),
});
