/**
 * @fileoverview File management service providing utilities for file manipulation,
 * validation, and cleanup operations.
 * @module FileHelper
 */

import path from "node:path";
import fs from "node:fs";
import mime from "mime-types";
import crypto from "node:crypto";
import { Logger } from "./logger";
import { AppError } from "@common/errors/app.error";
import { IFileHelper, FileInfo } from "../interfaces/IFileHelper";

export class FileHelper implements IFileHelper {
    /**
     * Retrieves detailed information about a file
     * @param {string} filePath - Path of the file to analyze
     * @throws {Error} If the file doesn't exist or is not accessible
     * @returns {FileInfo} File information
     */
    getFileInfos(filePath: string): FileInfo {
        try {
            if (!fs.existsSync(filePath)) {
                throw new AppError({ message: `File does not exist: ${filePath}`, code: 404 });
            }

            const stats = fs.statSync(filePath);
            if (!stats.isFile()) {
                throw new AppError({ message: `Path does not point to a file: ${filePath}`, code: 400 });
            }

            const mimeType = mime.lookup(filePath) || "application/octet-stream";

            return {
                filename: path.basename(filePath),
                path: filePath,
                size: stats.size,
                mimeType,
            };
        } catch (error) {
            Logger.Error("Error retrieving file information:", { error, filePath });
            throw error;
        }
    }

    /**
     * Normalizes a filename by removing special characters and optionally adding
     * a random identifier
     * @param {string} filename - Filename to normalize
     * @param {boolean} [appendRandom=true] - Whether to append a random identifier
     * @throws {Error} If the filename is invalid
     * @returns {string} Normalized filename
     */
    getNormalizedFileName(filename: string, appendRandom = true): string {
        try {
            const normalized = path.normalize(filename);
            const extension = path.extname(normalized);
            const baseName = path.basename(normalized, extension);

            let finalName: string;

            if (appendRandom) {
                try {
                    const random = crypto.randomBytes(16).toString("hex");
                    finalName = `${baseName}-${random}${extension}`;
                } catch (error) {
                    Logger.Error("Error generating random bytes", { error });
                    // Fallback to timestamp if crypto fails
                    finalName = `${baseName}-${Date.now()}${extension}`;
                }
            } else {
                finalName = `${baseName}${extension}`;
            }

            // Clean special characters
            const cleaned = finalName.replace(/[^a-zA-Z0-9.]+/g, "_");
            return path.join(path.dirname(normalized), cleaned);
        } catch (error) {
            Logger.Error("Error normalizing filename", { error, filename });
            throw error;
        }
    }

    /**
     * Validates and returns the MIME type of a file
     * @param {string} filePath - Path of the file to validate
     * @throws {Error} If the file is invalid or inaccessible
     * @returns {Promise<string>} File's MIME type
     */
    async validateMimeType(filePath: string): Promise<string> {
        try {
            const fileInfo = this.getFileInfos(filePath);
            return fileInfo.mimeType;
        } catch (error) {
            Logger.Error("Error validating MIME type", { error, filePath });
            throw error;
        }
    }

    /**
     * Cleans up files older than a maximum age in a directory
     * @param {string} directory - Path of the directory to clean
     * @param {number} maxAge - Maximum age of files in minutes
     * @throws {Error} If the directory is invalid or inaccessible
     * @returns {Promise<void>}
     */
    async cleanupOldFiles(directory: string, maxAge: number): Promise<void> {
        try {
            if (!fs.existsSync(directory)) {
                throw new AppError({ message: `Directory does not exist: ${directory}`, code: 404 });
            }

            const files = await fs.promises.readdir(directory);
            const now = Date.now();

            await Promise.all(
                files.map(async (file) => {
                    const filePath = path.join(directory, file);
                    try {
                        const stats = await fs.promises.stat(filePath);
                        const fileAge = (now - stats.mtimeMs) / (1000 * 60);

                        if (fileAge > maxAge) {
                            await fs.promises.unlink(filePath);
                            Logger.Debug(`Cleaned up file: ${file}`);
                        }
                    } catch (error) {
                        Logger.Error("Error processing file during cleanup", { error, file });
                        // Continue with other files even if one fails
                    }
                })
            );
        } catch (error) {
            Logger.Error("Error during file cleanup", { error, directory });
            throw error;
        }
    }

    /**
     * Converts a data URL to a File object
     * @param {string} dataUrl - The data URL to convert
     * @param {string} fileName - The name to give to the resulting file
     * @throws {Error} If the data URL is invalid or conversion fails
     * @returns {Promise<File>} The resulting File object
     */
    async dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
        try {
            const res: Response = await fetch(dataUrl);
            if (!res.ok) {
                throw new AppError({ message: `Failed to fetch data URL: ${res.statusText}`, code: res.status });
            }
            const blob: Blob = await res.blob();
            return new File([blob], fileName);
        } catch (error) {
            Logger.Error("Error converting data URL to file", { error, fileName });
            throw error;
        }
    }
}
