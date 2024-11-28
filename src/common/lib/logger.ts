import winston from "winston";
import "winston-daily-rotate-file";
import Env from "@common/config/env.config";

// Define custom log levels and colors
const logLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5,
        silly: 6,
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "green",
        http: "magenta",
        verbose: "cyan",
        debug: "blue",
        silly: "gray",
    },
};

// Apply colors to Winston
winston.addColors(logLevels.colors);

// Daily rotate file transport for logging
const fileTransport = new winston.transports.DailyRotateFile({
    dirname: "logs",
    filename: "%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxFiles: "14d",
    level: "silly",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Log in JSON format
    ),
});

// Console transport for development mode
const consoleTransport = new winston.transports.Console({
    level: "debug",
    format: winston.format.combine(
        winston.format.colorize({ all: true }), // Colorized logs in the console
        winston.format.simple() // Simple and readable format for the console
    ),
});

// Create the main logger with multiple transports
export const logger = winston.createLogger({
    levels: logLevels.levels,
    transports: [fileTransport, ...(Env.NODE_ENV === "development" ? [consoleTransport] : [])],
    exitOnError: false, // Do not exit on error
});

export const Logger = {
    /**
     * Logs an error message with additional meta information.
     * @param message - The error message to log.
     * @param meta - Optional additional metadata (e.g., error code, stack trace).
     */
    Error(message: string, meta?: any) {
        logger.error(message, meta ? { meta } : undefined);
    },

    /**
     * Logs a warning message with additional meta information.
     * @param message - The warning message to log.
     * @param meta - Optional additional metadata (e.g., context, warning details).
     */
    Warn(message: string, meta?: Record<string, unknown>) {
        logger.warn(message, meta ? { meta } : undefined);
    },

    /**
     * Logs an informational message with additional meta information.
     * @param message - The info message to log.
     * @param meta - Optional additional metadata (e.g., user ID, context).
     */
    Info(message: string, meta?: Record<string, unknown>) {
        logger.info(message, meta ? { meta } : undefined);
    },

    /**
     * Logs HTTP request details including method, URL, status code, and optional response time.
     * @param method - HTTP method (e.g., GET, POST).
     * @param url - URL of the request.
     * @param statusCode - HTTP response status code.
     * @param message - Additional message about the request (e.g., 'OK', 'Not Found').
     * @param responseTime - Optional response time in milliseconds.
     */
    Http(method: string, url: string, statusCode: number, message: string, responseTime?: number, usermeta?: any) {
        logger.http(`${method} ${url} - ${statusCode}`, {
            meta: {
                method,
                url,
                statusCode,
                message,
                responseTime: responseTime ? `${responseTime}ms` : undefined,
                usermeta: usermeta ? usermeta : undefined,
            },
        });
    },

    /**
     * Logs a verbose message with additional meta information.
     * @param message - The verbose message to log.
     * @param meta - Optional additional metadata (e.g., detailed debug info).
     */
    Verbose(message: string, meta?: Record<string, unknown>) {
        logger.verbose(message, meta ? { meta } : undefined);
    },

    /**
     * Logs a debug message with additional meta information.
     * @param message - The debug message to log.
     * @param meta - Optional additional metadata (e.g., variable values, execution details).
     */
    Debug(message: string, meta?: Record<string, unknown>) {
        logger.debug(message, meta ? { meta } : undefined);
    },

    /**
     * Logs a silly (low priority) message with additional meta information.
     * @param message - The silly message to log.
     * @param meta - Optional additional metadata (e.g., very detailed low-level information).
     */
    Silly(message: string, meta?: Record<string, unknown>) {
        logger.silly(message, meta ? { meta } : undefined);
    },
};
