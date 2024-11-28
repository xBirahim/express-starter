import { pgTable, serial, varchar, unique, boolean, timestamp } from "drizzle-orm/pg-core";

export const User = pgTable(
    "user",
    {
        id: serial("id").primaryKey().notNull(),
        email: varchar("email").notNull(),
        password: varchar("password").notNull(),
        emailVerified: boolean("email_verified").notNull().default(false),
        active: boolean("active").notNull().default(true),
        lastLoginAt: timestamp("last_login_at", {
            withTimezone: true,
            mode: "date",
        }),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "date",
        })
            .notNull()
            .defaultNow(),
    },
    (table) => {
        return {
            userEmailKey: unique("User_email_key").on(table.email),
        };
    }
);
