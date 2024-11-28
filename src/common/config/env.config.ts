import type { z } from "zod";
import { EnvSchema } from "./validators/env.validator";

const validateEnv = () => {
    try {
        const result = EnvSchema.safeParse(process.env);
        if (!result.success) {
            console.error("❌ Invalid environment variables:", JSON.stringify(result.error.format(), null, 2));
            throw new Error("Invalid environment variables");
        }
        return result.data;
    } catch (error) {
        console.error("❌ Error validating environment variables:", error);
        throw error;
    }
};

type EnvironmentVariables = z.infer<typeof EnvSchema>;

const Env: EnvironmentVariables = validateEnv();

export default Env;
