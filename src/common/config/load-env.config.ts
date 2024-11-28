import dotenv from "dotenv";
import path from "node:path";

const loadEnv = () => {
    const environment = process.env.NODE_ENV || "development";
    const envPath = path.resolve(process.cwd(), ".env");

    const result = dotenv.config({ path: envPath });

    if (result.error) {
        console.warn(`Failed to load .env file from ${envPath}`, result.error);
    } else {
        console.log(`Loaded environment variables from ${envPath}`);
    }
};

export default loadEnv;
