import { S3Client } from "@aws-sdk/client-s3";

if (
  !process.env.ACCESS_KEY_ID ||
  !process.env.SECRET_ACCESS_KEY ||
  !process.env.S3_BUCKET_NAME
) {
  throw new Error("AWS credentials or bucket name not configured");
}

export const s3Client = new S3Client({
  region: process.env.REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});
