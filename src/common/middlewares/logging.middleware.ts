import morgan from "morgan";
import { Logger } from "@common/lib/logger";
import type { Request, Response } from "express";

morgan.token("response-time-ms", (req: Request, res: Response) => {
    return `${res.getHeader("X-Response-Time")}ms`;
});

//TODO [ ] - make it work
/**
 * Middleware function for logging HTTP requests using Morgan.
 * 
 * This middleware logs the HTTP method, URL, status code, content length, 
 * response time, and request payload using the Logger.Http method.
 * 
 * @param tokens - Morgan tokens for extracting request and response data.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns null
 */
export const loggingMiddleware = morgan((tokens, req: Request, res: Response) => {
    const logData = {
        method: tokens.method(req, res) ?? "UNKNOWN",
        url: tokens.url(req, res) ?? "UNKNOWN",
        status: Number.parseInt(tokens.status(req, res) ?? "0", 10),
        contentLength: tokens.res(req, res, "content-length"),
        responseTime: Number.parseFloat(tokens["response-time"](req, res) ?? "0"),
    };

    Logger.Http(
        logData.method,
        logData.url,
        logData.status,
        `Content Length: ${logData.contentLength}`,
        logData.responseTime,
        req.payload
    );

    return null;
});
