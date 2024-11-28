import type { NextFunction, Request, Response } from "express";
import { CacheManager } from "@common/providers/cache/cache";
import { Logger } from "@common/lib/logger";

/**
 * Options for configuring the rate limiter middleware.
 * 
 * @interface RateLimiterOptions
 * 
 * @property {number} window - The time window in milliseconds for which the rate limit is applied.
 * @property {number} limit - The maximum number of requests allowed within the time window.
 * @property {number} [status] - The HTTP status code to send when the rate limit is exceeded. Defaults to 429.
 * @property {string} [message] - The message to send when the rate limit is exceeded.
 * @property [handler] - Custom handler function to execute when the rate limit is exceeded.
 */
interface RateLimiterOptions {
    window: number;
    limit: number;
    status?: number;
    message?: string;
    handler?: (req: Request, res: Response, next: NextFunction) => void;
}

const cacheService = new CacheManager();

/**
 * Middleware to limit the rate of incoming requests based on IP address.
 *
 * @param {RateLimiterOptions} options - Configuration options for the rate limiter.
 * @returns An express middleware function to enforce rate limiting.
 *
 *  *
 * The middleware uses a cache service to track the number of requests from each IP address.
 * If the number of requests exceeds the specified maximum within the time window, a status (`429` by default)
 * code response is sent.
 *
 * @example
 * ```typescript
 * app.use(rateLimiter({ windowMs: 60000, max: 100 }));
 * ```
 */
export const rateLimiterMilldeware = (options: RateLimiterOptions) => {
    const statusCode = options.status || 429;

    return async (req: Request, res: Response, next: NextFunction) => {
        const key = `rate-limit:${req.ip}`;
        const current = await cacheService.get(key);

        if (current) {
            const requests = Number.parseInt(current, 10);

            if (requests >= options.limit) {
                Logger.Warn("Too many requests", { ip: req.ip, headers: req.headers, options: options });

                if (options.handler) {
                    return options.handler(req, res, next);
                }

                return res.status(statusCode).json({
                    status: statusCode,
                    message: options.message || "Too many requests, please try again later.",
                });
            }

            await cacheService.set(key, (requests + 1).toString(), options.window / 1000);
        } else {
            await cacheService.set(key, "1", options.window / 1000);
        }

        next();
    };
};
