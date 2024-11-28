import { isAppError } from "@common/errors/app.error";
import { Logger } from "@common/lib//logger";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

/**
 * Middleware to handle errors in the application.
 *
 * @param error - The error object that was thrown.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the stack.
 *
 * This middleware handles different types of errors:
 * - ZodError: Validation errors from Zod schema validation.
 * - AppError: Custom application errors.
 * - SyntaxError: Errors related to JSON parsing.
 * - Any other unhandled errors.
 *
 * Depending on the type of error, 
 * it logs the error and sends an appropriate HTTP response with a status code and error message.
 */
export const errorMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof ZodError) {
        Logger.Error("Zod validation error", error);
        const errorMessages = error.issues.map((issue) => `${issue.path.join(".")} - ${issue.message}`);
        return res.status(400).json({ status: 400, error: errorMessages });
    }

    if (isAppError(error)) {
        Logger.Error(error.message, error);
        return res.status(error.statusCode).json({ status: error.statusCode, error: error.message });
    }

    if (error instanceof SyntaxError) {
        Logger.Error("Syntax error", error);
        return res.status(400).json({ status: 400, error: "Bad request" });
    }

    Logger.Error("Unhandled error", error.stack ? { error: error, stack: error.stack } : { error: error });
    return res.status(500).json({ status: 500, error: "Internal server error" });
};
