import loadEnv from "@common/config/load-env.config";
loadEnv();

import appConfig from "@common/config/app.config";
import { Logger } from "@common/lib/logger";
import app from "@/app";

const startServer = (): void => {
    try {
        app.listen(appConfig.port, () => {
            Logger.Info(`Server running at PORT: ${appConfig.port}`);
        });
    } catch (error) {
        handleError(error);
    }
};

const handleError = (error: any): void => {
    Logger.Error("An error occurred", { error });
    throw new Error(error.message);
};

startServer();
