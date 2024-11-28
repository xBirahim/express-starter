interface CreateAppErrorProps {
    message: string;
    code: number;
    cause?: any;
}

/**
 * Represents an application-specific error.
 * Extends the built-in `Error` class to include additional properties.
 */
export class AppError extends Error {
    /**
     * The HTTP status code associated with the error.
     */
    public readonly statusCode: number;

    /**
     * Creates an instance of `AppError`.
     *
     * @param message - The error message.
     * @param statusCode - The HTTP status code.
     */
    constructor(props: CreateAppErrorProps) {
        super(props.message);
        this.statusCode = props.code;
        this.cause = props.cause;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Type guard to check if an error is an instance of AppError.
 *
 * @param error - The error to check.
 * @returns True if the error is an instance of AppError, false otherwise.
 */
export const isAppError = (error: unknown): error is AppError => {
    return error instanceof AppError;
};
