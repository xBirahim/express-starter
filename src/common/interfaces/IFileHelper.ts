export interface IFileHelper {
    getFileInfos(filePath: string): FileInfo;
    getNormalizedFileName(filename: string, appendRandom?: boolean): string;
    validateMimeType(filePath: string): Promise<string>;
    cleanupOldFiles(directory: string, maxAge: number): Promise<void>;
    dataUrlToFile(dataUrl: string, fileName: string): Promise<File>;
}

/**
 * Interface describing file information
 * @interface FileInfo
 */
export interface FileInfo {
    /** Name of the file */
    filename: string;
    /** Complete file path */
    path: string;
    /** File size in bytes */
    size: number;
    /** File MIME type */
    mimeType: string;
}
