require("../instrument.js");

import * as Sentry from "@sentry/node";
import express from "express";

import { buildRoutes } from "@/routes";
import { errorMiddleware } from "@common/middlewares/error.middleware.";
import { loggingMiddleware } from "@common/middlewares/logging.middleware";
import { notFoundMiddleware } from "@common/middlewares/not-found.middleware";
import { setupParserMiddleware } from "@common/middlewares/parser.middleware";
import { setupSecurityMiddleware } from "@common/middlewares/security.middleware";

import appConfig from "@/common/config/app.config";

export class App {
    public app: express.Express;

    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setupMiddleware(): void {
        this.app.use(loggingMiddleware);
        setupSecurityMiddleware(this.app);
        setupParserMiddleware(this.app);
    }

    private setupRoutes(): void {
        buildRoutes(this.app);

        if (appConfig.environment === "development") {
            this.app.get("/debug-sentry", () => {
                throw new Error("My first Sentry error!");
            });
        }
    }

    private setupErrorHandling(): void {
        Sentry.setupExpressErrorHandler(this.app);
        this.app.use(notFoundMiddleware);
        this.app.use(errorMiddleware);
    }
}

export default new App().app;
