interface AppConfig {
    port: number;
    environment: string;
    cors: {
        origin: string;
        allowedHeaders: string[];
    };
}

const appConfig: AppConfig = {
    port: Number(process.env.PORT) || 8000,
    environment: process.env.NODE_ENV || "development",
    cors: {
        origin: "*",
        allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    },
};

export default appConfig;
