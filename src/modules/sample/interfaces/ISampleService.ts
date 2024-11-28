export interface ISampleService {
    uploadFile: ({ filePath, originalFileName }: { filePath: string; originalFileName: string }) => Promise<string>;
    downloadFile: (fileKey: string) => Promise<{ base64: string; contentType: string }>;
}
