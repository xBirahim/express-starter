import type { IFileHelper } from "@/common/interfaces/IFileHelper";
import type { ISampleService } from "../interfaces/ISampleService";
import type { IBucketManager } from "@/common/providers/bucket/IBucketManager";
import { AppError } from "@/common/errors/app.error";

export class SampleService implements ISampleService {
    constructor(
        private fileHelper: IFileHelper,
        private bucketManager: IBucketManager
    ) {}

    async downloadFile(fileKey: string): Promise<{ base64: string; contentType: string }> {
        const fileData = await this.bucketManager.downloadToMemoryBase64({ fileKey });

        if (!fileData) {
            throw new AppError({ message: "File not found !", code: 404 });
        }
        return fileData;
    }

    async uploadFile({ filePath, originalFileName }: { filePath: string; originalFileName: string }): Promise<string> {
        const fileInfos = this.fileHelper.getFileInfos(filePath);

        // -- Save the file to S3
        const fileKey = await this.bucketManager.upload({
            filePath: filePath,
            fileName: originalFileName,
            mimeType: fileInfos.mimeType,
        });

        if (!fileKey) {
            throw new AppError({ message: "Error while uploading the file", code: 500 });
        }

        return fileKey;
    }
}
