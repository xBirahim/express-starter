import fs from "node:fs";
import path from "node:path";
import { FileHelper } from "@common/lib/file";
import { AppError } from "@common/errors/app.error";
import { Logger } from "@common/lib/logger";
import type { NextFunction, Request, Response } from "express";
import multer, { type FileFilterCallback } from "multer";

interface UploadOptions {
    destination: string;
    allowedFiles: string[];
    allowedMimeTypes: string[];
    maxFileSize: number;
    filePrefix: string;
}

/**
 * Default options for file upload middleware.
 *
 * @property {string} destination - The directory where uploaded files will be stored.
 * @property {string[]} allowedFiles - An array of allowed file extensions.
 * @property {string[]} allowedMimeTypes - An array of allowed MIME types.
 * @property {number} maxFileSize - The maximum allowed file size in bytes.
 * @property {string} filePrefix - A prefix to be added to the uploaded file names.
 */
const DEFAULT_OPTIONS: UploadOptions = {
    destination: "temp/",
    allowedFiles: [".jpg", ".jpeg", ".png", ".pdf"],
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filePrefix: "",
};

const fileHelper = new FileHelper();

/**
 * Creates a multer storage engine with the specified upload options.
 * Ensures that the destination directory exists, creating it if necessary.
 *
 * @param options - The options for the upload, including destination and file prefix.
 * @returns - The configured multer storage engine.
 */
const createStorage = (options: UploadOptions): multer.StorageEngine => {
    if (!fs.existsSync(options.destination)) {
        fs.mkdirSync(options.destination, { recursive: true });
    }

    return multer.diskStorage({
        destination: (req: Request, file: Express.Multer.File, cb) => {
            cb(null, options.destination);
        },
        filename: (req: Request, file: Express.Multer.File, cb) => {
            const filename = fileHelper.getNormalizedFileName(`${options.filePrefix}${file.originalname}`, true);
            cb(null, filename);
        },
    });
};

/**
 * Creates a file filter middleware for Multer based on the provided options.
 *
 * @param options - The options for the file filter.
 * @returns - A Multer file filter function.
 */
const createFileFilter = (options: UploadOptions) => {
    return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const mimeType = file.mimetype.toLowerCase();

        if (!options.allowedFiles.includes(ext)) {
            return cb(
                new Error(
                    `The file type is not allowed. Here are the accepted types: ${options.allowedFiles.join(", ")}`
                )
            );
        }

        if (!options.allowedMimeTypes.includes(mimeType)) {
            return cb(
                new Error(
                    `The MIME type is not allowed. Here are the accepted types: ${options.allowedMimeTypes.join(", ")}`
                )
            );
        }

        cb(null, true);
    };
};

/**
 * Validates the uploaded file against the provided options.
 *
 * @param file - The uploaded file to validate.
 * @param options - The options to validate the file against.
 * @returns A promise that resolves to true if the file is valid.
 * @throws If the file validation fails.
 */
const validateFile = async (file: Express.Multer.File, options: UploadOptions): Promise<boolean> => {
    try {
        const fileInfo = await fileHelper.getFileInfos(file.path);
        const isValidMime = options.allowedMimeTypes.includes(fileInfo.mimeType);

        if (!isValidMime) {
            await fs.promises.unlink(file.path);
            throw new Error("The file content type is not allowed");
        }

        return true;
    } catch (error) {
        throw new AppError({
            message: "Validation failed",
            code: 400,
            cause: error instanceof Error ? error.message : "VALIDATION_FAILED",
        });
    }
};

/**
 * Middleware for handling single file uploads using multer.
 *
 * @param fieldName - The name of the form field that holds the file.
 * @param userOptions - Optional configuration for the upload process.
 * @returns Middleware function to handle the file upload.
 *
 * @throws If there is an error during the upload process or if no file is received.
 */
const SingleFileUpload = (fieldName: string, userOptions: Partial<UploadOptions> = {}) => {
    const options = { ...DEFAULT_OPTIONS, ...userOptions };
    const upload = multer({
        storage: createStorage(options),
        limits: { fileSize: options.maxFileSize },
        fileFilter: createFileFilter(options),
    });

    return async (req: Request, res: Response, next: NextFunction) => {
        upload.single(fieldName)(req, res, async (err: any) => {
            if (err) {
                return next(
                    new AppError({
                        message: err.message || "Uploading error",
                        code: 400,
                        cause: err instanceof multer.MulterError ? err.code : "UPLOAD_ERROR",
                    })
                );
            }

            if (!req.file) {
                return next(
                    new AppError({
                        message: "No file received",
                        code: 400,
                        cause: "NO_FILE",
                    })
                );
            }

            try {
                await validateFile(req.file, options);
                Logger.Debug("Uploaded file successfully", { file: req.file.filename });
                next();
            } catch (error) {
                next(error);
            }
        });
    };
};

/**
 * Middleware for handling multiple file uploads using multer.
 *
 * @param fieldName - The name of the field in the form that contains the files.
 * @param maxFiles - The maximum number of files to accept.
 * @param userOptions - Custom options to override the default upload options.
 * @returns Middleware function to handle file uploads.
 *
 * @throws If there is an error during file upload or validation.
 */
const MultipleFilesUpload = (fieldName: string, maxFiles = 10, userOptions: Partial<UploadOptions> = {}) => {
    const options = { ...DEFAULT_OPTIONS, ...userOptions };
    const upload = multer({
        storage: createStorage(options),
        limits: { fileSize: options.maxFileSize },
        fileFilter: createFileFilter(options),
    });

    return async (req: Request, res: Response, next: NextFunction) => {
        upload.array(fieldName, maxFiles)(req, res, async (err: any) => {
            if (err) {
                return next(
                    new AppError({
                        message: err.message || "Error while uploading files",
                        code: 400,
                        cause: err instanceof multer.MulterError ? err.code : "UPLOAD_ERROR",
                    })
                );
            }

            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                return next(
                    new AppError({
                        message: "No files received",
                        code: 400,
                        cause: "NO_FILES",
                    })
                );
            }

            try {
                for (const file of req.files) {
                    await validateFile(file, options);
                }
                Logger.Debug("Files uploaded successfully", {
                    count: req.files.length,
                    files: req.files.map((f) => f.filename),
                });
                next();
            } catch (error) {
                next(error);
            }
        });
    };
};

/**
 * Middleware for handling file uploads for specified fields using multer.
 *
 * @param fields - An array of objects specifying the fields to upload and their maximum count.
 * @param - Optional user-defined upload options to override the default options.
 * @returns Middleware function to handle file uploads.
 *
 * @throws {AppError} If there is an error during file upload or validation.
 */
const FieldsUpload = (fields: { name: string; maxCount: number }[], userOptions: Partial<UploadOptions> = {}) => {
    const options = { ...DEFAULT_OPTIONS, ...userOptions };
    const upload = multer({
        storage: createStorage(options),
        limits: { fileSize: options.maxFileSize },
        fileFilter: createFileFilter(options),
    });

    return async (req: Request, res: Response, next: NextFunction) => {
        upload.fields(fields)(req, res, async (err: any) => {
            if (err) {
                return next(
                    new AppError({
                        message: err.message || "Error while uploading fields",
                        code: 400,
                        cause: err instanceof multer.MulterError ? err.code : "UPLOAD_ERROR",
                    })
                );
            }

            if (!req.files || Object.keys(req.files).length === 0) {
                return next(
                    new AppError({
                        message: "No file received",
                        code: 400,
                        cause: "NO_FILES",
                    })
                );
            }

            try {
                for (const fieldFiles of Object.values(req.files)) {
                    for (const file of fieldFiles) {
                        await validateFile(file, options);
                    }
                }
                Logger.Debug("Fields uploaded successfully", {
                    fields: Object.keys(req.files),
                    files: Object.entries(req.files).map(([field, files]) => ({
                        field,
                        count: files.length,
                        filenames: files.map((f) => f.filename),
                    })),
                });
                next();
            } catch (error) {
                next(error);
            }
        });
    };
};

export const FileUploadMiddleware = {
    SingleFileUpload,
    MultipleFilesUpload,
    FieldsUpload,
};
