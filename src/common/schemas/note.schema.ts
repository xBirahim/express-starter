import { boolean, pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { User } from "./user.schema";
import { sql } from "drizzle-orm";

export const Note = pgTable("note", {
    id: serial("id").primaryKey().notNull(),
    userId: integer("user_id")
        .notNull()
        .references(() => User.id),
    title: text("title").notNull(),
    content: text("content").notNull(),
    pinned: boolean("pinned").notNull().default(false),
    createdAt: timestamp("created_at", {
        withTimezone: true,
        mode: "date",
    })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at", {
        withTimezone: true,
        mode: "date",
    })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

Note.$inferInsert;
