import type { NextFunction, Request, Response } from "express";

/**
 * Middleware to check if a specific cookie is present in the request.
 *
 * @param cookieName - The name of the cookie to check for.
 * @returns A middleware function that checks for the presence of the specified cookie.
 * If the cookie is not present, it responds with a 401 status and a JSON message.
 * Otherwise, it calls the next middleware function.
 */
export const hasCookie = (cookieName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.cookies[cookieName]) {
            return res.status(401).json({ message: `${cookieName} is required` });
        }
        next();
    };
};
