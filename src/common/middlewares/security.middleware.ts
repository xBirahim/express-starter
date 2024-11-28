import type express from "express";
import helmet from "helmet";
import cors from "cors";
import appConfig from "@common/config/app.config";

/**
 * Sets up security middleware for the Express application.
 * 
 * This middleware includes:
 * - Helmet for securing HTTP headers.
 * - Custom CORS headers based on application configuration.
 * - CORS middleware for handling cross-origin requests.
 * 
 * @param app - The Express application instance.
 */
export const setupSecurityMiddleware = (app: express.Application): void => {
    app.use(helmet());
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", appConfig.cors.origin);
        res.header("Access-Control-Allow-Headers", appConfig.cors.allowedHeaders.join(", "));
        next();
    });
    app.use(cors());
};
