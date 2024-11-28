import "dotenv/config";
import Env from "@common/config/env.config";
import { Logger } from "@common/lib/logger";
import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const migrationClient = postgres(Env.DB_CONNECTION_STRING, { max: 1 });
const db: PostgresJsDatabase = drizzle(migrationClient);

/**
 * Main function to handle the database migration process.
 * 
 * This function logs the start of the migration process, performs the migration
 * using the specified database and migrations folder, and then logs the success
 * message upon completion. If an error occurs during the migration, it catches
 * the error and logs an error message with the error details.
 * 
 * @async
 * @function main
 * @returns {Promise<void>} A promise that resolves when the migration process is complete.
 */
const main = async () => {
    try {
        Logger.Info("Migrating database...");
        await migrate(db, { migrationsFolder: "./migrations" });
        await migrationClient.end();
        Logger.Info("Database migrated successfully!");
    } catch (error) {
        Logger.Error("Error migrating database", { error: error });
    }
};

main();
