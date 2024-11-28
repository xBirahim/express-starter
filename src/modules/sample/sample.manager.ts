import { FileHelper } from "@/common/lib/file";
import { BucketManager } from "@/common/providers/bucket/bucket";
import { S3Client } from "@aws-sdk/client-s3";
import { SampleService } from "./services/SampleService";

const fileHelper = new FileHelper();
const client = new S3Client();
const bucketManager = new BucketManager(client, fileHelper);

export const sampleManager = new SampleService(fileHelper, bucketManager);