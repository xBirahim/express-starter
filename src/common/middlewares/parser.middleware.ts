import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";

/**
 * Sets up the parser middleware for the provided Express application.
 *
 * This middleware includes:
 * - `express.json()`: Parses incoming requests with JSON payloads.
 * - `bodyParser.json()`: Parses incoming requests with JSON payloads (redundant if `express.json()` is used).
 * - `cookieParser()`: Parses Cookie header and populates `req.cookies` with an object keyed by the cookie names.
 * - `bodyParser.urlencoded({ extended: true })`: Parses incoming requests with URL-encoded payloads.
 *
 * @param app - The Express application instance to set up the middleware for.
 */
export const setupParserMiddleware = (app: express.Application): void => {
    app.use(express.json());
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: true }));
};
