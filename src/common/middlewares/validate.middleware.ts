import type { Request, Response, NextFunction } from "express";
import type { z } from "zod";

type ValidationSchema = {
    body?: z.ZodSchema;
    query?: z.ZodSchema;
    params?: z.ZodSchema;
};

/**
 * Middleware to validate request parameters, query, and body against a given schema.
 *
 * @param {ValidationSchema} schema - The schema to validate the request against.
 * @returns {Function} Middleware function that validates the request and calls the next middleware.
 *
 * @example
 * import { validate } from './validate.middleware';
 * import { someSchema } from './schemas';
 *
 * app.post('/endpoint', validate(someSchema), (req, res) => {
 *   res.send('Validated!');
 * });
 */
export const validate = (schema: ValidationSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedParams = schema.params ? await schema.params.parseAsync(req.params) : req.params;
            req.params = validatedParams;

            const validatedQuery = schema.query ? await schema.query.parseAsync(req.query) : req.query;
            req.query = validatedQuery;

            const validatedBody = schema.body ? await schema.body.parseAsync(req.body) : req.body;
            req.body = validatedBody;

            return next();
        } catch (error) {
            return next(error);
        }
    };
};
