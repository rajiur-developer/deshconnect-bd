import "server-only";

import { createHash, createHmac } from "node:crypto";

type R2Config = {
  endpoint: URL;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: URL;
};

function config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const publicUrlValue = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim();

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrlValue) {
    throw new Error("Cloudflare R2 is not fully configured.");
  }

  const endpointValue = (process.env.R2_ENDPOINT?.trim() || `https://${accountId}.r2.cloudflarestorage.com`).replace(/\/+$/, "");
  const endpoint = new URL(endpointValue);
  if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new Error("R2_ENDPOINT must be a valid HTTPS endpoint.");
  }

  const publicUrl = new URL(publicUrlValue);
  if (publicUrl.protocol !== "https:" || publicUrl.username || publicUrl.password || publicUrl.search || publicUrl.hash) {
    throw new Error("NEXT_PUBLIC_R2_PUBLIC_URL must be a valid HTTPS public media URL.");
  }

  return { endpoint, accessKeyId, secretAccessKey, bucket, publicUrl };
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim()
    && process.env.R2_ACCESS_KEY_ID?.trim()
    && process.env.R2_SECRET_ACCESS_KEY?.trim()
    && process.env.R2_BUCKET_NAME?.trim()
    && process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim(),
  );
}

function encode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function encodeKey(key: string): string {
  return key.split("/").map(encode).join("/");
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: Buffer | string, value: string): Buffer {
  return createHmac("sha256", key).update(value).digest();
}

function canonicalQuery(entries: Array<[string, string]>): string {
  return entries
    .map(([key, value]) => [encode(key), encode(value)] as [string, string])
    .sort(([keyA, valueA], [keyB, valueB]) => keyA.localeCompare(keyB) || valueA.localeCompare(valueB))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

function presign(
  method: "PUT" | "HEAD" | "DELETE",
  key: string,
  expiresSeconds: number,
  contentType?: string,
): { url: string; headers: Record<string, string> } {
  const settings = config();
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";
  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const canonicalUri = `${settings.endpoint.pathname.replace(/\/+$/, "")}/${encode(settings.bucket)}/${encodeKey(key)}` || "/";
  const headers: Record<string, string> = { host: settings.endpoint.host };
  if (contentType) {
    headers["content-type"] = contentType;
    headers["cache-control"] = "public, max-age=31536000, immutable";
  }
  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalHeaders = Object.keys(headers).sort().map((name) => `${name}:${headers[name].trim()}\n`).join("");
  const query: Array<[string, string]> = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", `${settings.accessKeyId}/${scope}`],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", String(expiresSeconds)],
    ["X-Amz-SignedHeaders", signedHeaders],
  ];
  const queryString = canonicalQuery(query);
  const canonicalRequest = [
    method,
    canonicalUri,
    queryString,
    canonicalHeaders,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    sha256(canonicalRequest),
  ].join("\n");
  const dateKey = hmac(`AWS4${settings.secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, service);
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const url = `${settings.endpoint.origin}${canonicalUri}?${queryString}&X-Amz-Signature=${signature}`;
  const requestHeaders = contentType
    ? { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" }
    : {};
  return { url, headers: requestHeaders };
}

export function createR2UploadUrl(key: string, contentType: string): { uploadUrl: string; headers: Record<string, string> } {
  const signed = presign("PUT", key, 600, contentType);
  return { uploadUrl: signed.url, headers: signed.headers };
}

export function getR2PublicUrl(key: string): string {
  const { publicUrl } = config();
  const base = publicUrl.toString().replace(/\/+$/, "");
  return `${base}/${encodeKey(key)}`;
}

export async function verifyR2Object(key: string): Promise<{ size: number; contentType: string }> {
  const signed = presign("HEAD", key, 60);
  const response = await fetch(signed.url, {
    method: "HEAD",
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error("Uploaded file could not be verified in R2.");
  const size = Number(response.headers.get("content-length") ?? 0);
  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (!Number.isSafeInteger(size) || size < 1 || !contentType) {
    throw new Error("R2 returned incomplete file metadata.");
  }
  return { size, contentType };
}

export async function deleteR2Object(key: string): Promise<void> {
  const signed = presign("DELETE", key, 60);
  const response = await fetch(signed.url, {
    method: "DELETE",
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok && response.status !== 404) throw new Error("Could not delete the R2 object.");
}
