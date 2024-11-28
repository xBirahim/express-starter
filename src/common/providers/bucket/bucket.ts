import fs from "node:fs";
import path from "node:path";
import type { IFileHelper } from "@/common/interfaces/IFileHelper";
import {
    DeleteObjectCommand,
    GetObjectCommand,
    NoSuchKey,
    NotFound,
    PutObjectCommand,
    S3Client,
    S3ServiceException,
    type StorageClass,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Env from "@common/config/env.config";
import { AppError } from "@common/errors/app.error";
import { FileHelper } from "@common/lib/file";
import { format } from "date-fns";
import type { IBucketManager } from "./IBucketManager";

const bucketName = Env.BUCKET_NAME;

/**
 * Gère les erreurs S3 communes
 */
const handleS3Error = (error: unknown) => {
    if (error instanceof S3ServiceException) {
        if (error instanceof NoSuchKey || error instanceof NotFound) {
            throw new AppError({ message: error.message, code: 404, cause: error });
        }
        throw new AppError({ message: error.message, code: 500, cause: error });
    }

    throw error;
};

let client: S3Client;

try {
    client = new S3Client({
        endpoint: Env.BUCKET_ENDPOINT,
        region: Env.BUCKET_REGION,
        credentials: {
            accessKeyId: Env.BUCKET_ACCESS_KEY,
            secretAccessKey: Env.BUCKET_SECRET_KEY,
        },
    });
} catch (error) {
    handleS3Error(error);
}

export class BucketManager implements IBucketManager {
    constructor(
        private client: S3Client,
        private FileHelper: IFileHelper
    ) {}

    async upload({
        filePath,
        fileName,
        mimeType,
        storageClass,
    }: {
        filePath: string;
        fileName: string;
        mimeType: string;
        storageClass?: StorageClass;
    }): Promise<string | undefined> {
        try {
            if (!fs.existsSync(filePath)) {
                throw new AppError({
                    message: "Le fichier source n'existe pas",
                    code: 404,
                    cause: { filePath },
                });
            }

            const buffer = fs.readFileSync(filePath);
            const normalizedFileName = this.FileHelper.getNormalizedFileName(fileName);

            const fileKey = `${format(new Date(), "yyyy")}_${format(new Date(), "MM")}_${format(new Date(), "dd")}_${normalizedFileName}`;

            await client.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: fileKey,
                    Body: buffer,
                    StorageClass: storageClass,
                    ContentType: mimeType,
                })
            );

            return fileKey;
        } catch (error) {
            if (error instanceof AppError) throw error;
            handleS3Error(error);
        }
    }

    async downloadToFile({
        fileKey,
        destinationPath,
    }: {
        fileKey: string;
        destinationPath?: string;
    }): Promise<string | undefined> {
        try {
            let targetPath = destinationPath;
            if (!targetPath) {
                const tempDir = path.join(__dirname, "../../../temp");
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                targetPath = path.join(tempDir, path.basename(fileKey));
            }

            const data = await client.send(
                new GetObjectCommand({
                    Bucket: bucketName,
                    Key: fileKey,
                })
            );

            if (!data.Body) {
                throw NotFound;
            }

            const fileWriteStream = fs.createWriteStream(targetPath);

            const stream = new WritableStream({
                write(chunk) {
                    fileWriteStream.write(chunk);
                },
                close() {
                    fileWriteStream.close();
                },
                abort(err) {
                    fileWriteStream.destroy(err);
                    throw err;
                },
            });

            await new Promise((resolve, reject) => {
                fileWriteStream.on("finish", resolve);
                fileWriteStream.on("error", (err) => {
                    reject(
                        new AppError({
                            message: "Erreur lors de l'écriture du fichier",
                            code: 500,
                            cause: err,
                        })
                    );
                });
                data.Body?.transformToWebStream().pipeTo(stream).catch(reject);
            });

            return targetPath;
        } catch (error) {
            if (error instanceof AppError) throw error;
            handleS3Error(error);
        }
    }

    async downloadToMemoryBase64({
        fileKey,
    }: {
        fileKey: string;
    }): Promise<{ contentType: string; base64: string } | undefined> {
        try {
            const data = await client.send(
                new GetObjectCommand({
                    Bucket: bucketName,
                    Key: fileKey,
                })
            );

            if (!data.Body) {
                throw NotFound;
            }

            const contentType = data.ContentType || "application/octet-stream";
            const streamToString = await data.Body.transformToString("base64");

            return {
                contentType,
                base64: streamToString,
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            handleS3Error(error);
        }
    }

    async deleteFile({ fileKey }: { fileKey: string }): Promise<void> {
        try {
            await client.send(
                new DeleteObjectCommand({
                    Bucket: bucketName,
                    Key: fileKey,
                })
            );
        } catch (error) {
            handleS3Error(error);
        }
    }
    async getPresignedUploadUrl({
        fileKey,
        storageClass,
    }: {
        fileKey: string;
        storageClass?: StorageClass;
    }): Promise<string | undefined> {
        try {
            const presignedUrl = await getSignedUrl(
                client,
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: fileKey,
                    StorageClass: storageClass,
                }),
                { expiresIn: 1800 }
            );

            return presignedUrl;
        } catch (error) {
            handleS3Error(error);
        }
    }
}
