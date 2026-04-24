import { Storage } from "@google-cloud/storage";

function getStorage() {
  const keyB64 = process.env.GCS_SERVICE_ACCOUNT_KEY_B64;
  if (!keyB64) throw new Error("GCS_SERVICE_ACCOUNT_KEY_B64 is not set");
  const credentials = JSON.parse(Buffer.from(keyB64, "base64").toString("utf8"));
  return new Storage({ credentials });
}

function getBucket() {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) throw new Error("GCS_BUCKET_NAME is not set");
  return getStorage().bucket(bucketName);
}

export async function uploadImage(
  buffer: Buffer,
  path: string,
  contentType: string
): Promise<void> {
  const bucket = getBucket();
  const file = bucket.file(path);
  await file.save(buffer, { contentType, resumable: false });
}

export async function getSignedUrl(path: string, ttlSeconds: number): Promise<string> {
  const bucket = getBucket();
  const file = bucket.file(path);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + ttlSeconds * 1000,
  });
  return url;
}

export async function deleteImage(path: string): Promise<void> {
  const bucket = getBucket();
  await bucket.file(path).delete({ ignoreNotFound: true });
}
