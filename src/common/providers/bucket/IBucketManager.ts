import type { StorageClass } from "@aws-sdk/client-s3";

/**
 * Interface representing a bucket manager for handling file operations.
 */
export interface IBucketManager {
    /**
     * Uploads a file to the bucket.
     * @param params - The parameters for the upload operation.
     * @param params.filePath - The path to the file to be uploaded.
     * @param params.fileName - The name of the file to be uploaded.
     * @param params.mimeType - The MIME type of the file.
     * @param params.storageClass - (Optional) The storage class for the file.
     * @returns A promise that resolves to the URL of the uploaded file, or undefined if the upload fails.
     */
    upload({
        filePath,
        fileName,
        mimeType,
        storageClass,
    }: {
        filePath: string;
        fileName: string;
        mimeType: string;
        storageClass?: StorageClass;
    }): Promise<string | undefined>;

    /**
     * Downloads a file from the bucket to a specified destination path.
     * @param params - The parameters for the download operation.
     * @param params.fileKey - The key of the file to be downloaded.
     * @param params.destinationPath - (Optional) The path where the file should be saved.
     * @returns A promise that resolves to the path of the downloaded file, or undefined if the download fails.
     */
    downloadToFile({
        fileKey,
        destinationPath,
    }: {
        fileKey: string;
        destinationPath?: string;
    }): Promise<string | undefined>;

    /**
     * Downloads a file from the bucket and returns its content as a base64-encoded string.
     * @param params - The parameters for the download operation.
     * @param params.fileKey - The key of the file to be downloaded.
     * @returns A promise that resolves to an object containing the content type 
     * and base64-encoded content of the file, or undefined if the download fails.
     */
    downloadToMemoryBase64({ fileKey }: { fileKey: string }): Promise<
        | {
              contentType: string;
              base64: string;
          }
        | undefined
    >;

    /**
     * Deletes a file from the bucket.
     * @param params - The parameters for the delete operation.
     * @param params.fileKey - The key of the file to be deleted.
     * @returns A promise that resolves when the file is deleted.
     */
    deleteFile({ fileKey }: { fileKey: string }): Promise<void>;

    /**
     * Generates a presigned URL for uploading a file to the bucket.
     * @param params - The parameters for generating the presigned URL.
     * @param params.fileKey - The key of the file to be uploaded.
     * @param params.storageClass - (Optional) The storage class for the file.
     * @returns A promise that resolves to the presigned URL, or undefined if the operation fails.
     */
    getPresignedUploadUrl({
        fileKey,
        storageClass,
    }: {
        fileKey: string;
        storageClass?: StorageClass;
    }): Promise<string | undefined>;
}
