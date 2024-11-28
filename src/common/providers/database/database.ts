import Env from "@common/config/env.config";
import { Logger } from "@common/lib/logger";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "../../schemas";

export const client =
    Env.NODE_ENV === "test"
        ? ({} as unknown as Client)
        : new Client(
              Env.DB_CONNECTION_STRING || {
                  user: Env.DB_USERNAME,
                  password: Env.DB_PASSWORD,
                  host: Env.DB_HOSTNAME,
                  port: Env.DB_PORT,
                  database: Env.DB_NAME,
                  ssl: Env.DB_SSL,
              }
          );

if (Env.NODE_ENV !== "test") {
    client
        .connect()
        .then(() =>
            Logger.Debug("Connected to the database", {
                host: Env.DB_HOSTNAME,
                port: Env.DB_PORT,
                database: Env.DB_NAME,
            })
        )
        .catch((err) => {
            Logger.Error("Error connecting to the database", { error: err });
            client.end(() => Logger.Debug("Database connection closed"));
        });
}

export const db = drizzle(client, { schema });
