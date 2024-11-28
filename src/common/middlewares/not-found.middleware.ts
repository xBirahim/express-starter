import { AppError } from "@common/errors/app.error";
import type { NextFunction, Request, Response } from "express";

/**
 * Middleware to handle requests to routes that are not found.
 * Throws an `AppError` with a 404 status code and a message indicating the method and URL of the request.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next middleware function in the stack.
 * @throws - Throws an error with a 404 status code and a message indicating the method and URL of the request.
 */
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
    throw new AppError({ message: `Not Found - ${req.method} ${req.originalUrl}`, code: 404 });
};
