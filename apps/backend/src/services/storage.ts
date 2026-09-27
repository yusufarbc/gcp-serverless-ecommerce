import { Storage } from "@google-cloud/storage";

export class CloudStorageService {
  private storage = new Storage();
  private bucketName = process.env.GCS_BUCKET_NAME || "gcp-serverless-ecommerce-media";

  public async uploadBuffer(buffer: Buffer, destinationPath: string, contentType: string, isPublic = true) {
    const bucket = this.storage.bucket(this.bucketName);
    const file = bucket.file(destinationPath);
    await file.save(buffer, { contentType, resumable: false, metadata: { cacheControl: isPublic ? "public, max-age=86400" : "private" } });
    return `https://storage.googleapis.com/${this.bucketName}/${destinationPath}`;
  }
}
