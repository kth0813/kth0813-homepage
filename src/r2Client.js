/**
 * Cloudflare R2 Storage Client using AWS Signature Version 4 (Web Crypto API)
 * Supports full CRUD: Create/Upload, Read/Get, Update/Upload, Delete
 */

const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "de44c6a3ae70655650ef9b3041d0ac74";
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "27029cf3f0c56d22bc8e7dcacb8a45a864691971f470331349bc06a198bc68f7";
const ENDPOINT = (process.env.R2_ENDPOINT || "https://512f97425f2bc024206df0f42c7f6248.r2.cloudflarestorage.com").replace(/\/$/, "");
const DEFAULT_BUCKET = process.env.R2_BUCKET_NAME || "kth0813";
const REGION = "auto";
const SERVICE = "s3";

// Helper: SHA-256 Digest in Hex
async function sha256Hex(data) {
  const enc = new TextEncoder();
  const buf = typeof data === "string" ? enc.encode(data) : data;
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper: HMAC-SHA256
async function hmac(key, data) {
  const enc = new TextEncoder();
  const cryptoKey =
    typeof key === "string"
      ? await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
      : key;
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, typeof data === "string" ? enc.encode(data) : data);
  return signature;
}

// Helper: Derive AWS SigV4 Signing Key
async function getSigningKey(secretKey, dateStr, region, service) {
  const enc = new TextEncoder();
  const kSecret = await crypto.subtle.importKey("raw", enc.encode("AWS4" + secretKey), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const kDateBuf = await crypto.subtle.sign("HMAC", kSecret, enc.encode(dateStr));

  const kDate = await crypto.subtle.importKey("raw", kDateBuf, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const kRegionBuf = await crypto.subtle.sign("HMAC", kDate, enc.encode(region));

  const kRegion = await crypto.subtle.importKey("raw", kRegionBuf, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const kServiceBuf = await crypto.subtle.sign("HMAC", kRegion, enc.encode(service));

  const kService = await crypto.subtle.importKey("raw", kServiceBuf, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const kSigningBuf = await crypto.subtle.sign("HMAC", kService, enc.encode("aws4_request"));

  return crypto.subtle.importKey("raw", kSigningBuf, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * AWS SigV4 signed request fetcher for R2 S3 API
 */
async function r2Fetch(method, bucket, keyPath, body = null, extraHeaders = {}) {
  try {
    const bucketName = bucket || DEFAULT_BUCKET;
    const cleanKey = keyPath ? keyPath.replace(/^\//, "") : "";
    const path = cleanKey ? `/${bucketName}/${cleanKey}` : `/${bucketName}`;
    const url = `${ENDPOINT}${path}`;

    const host = new URL(ENDPOINT).host;
    const now = new Date();
    const isoDate = now.toISOString().replace(/[:-]/g, "").replace(/\.\d{3}/, "");
    const dateStr = isoDate.substring(0, 8); // YYYYMMDD

    // Payload SHA256
    let payloadArrayBuffer = null;
    let payloadHash = "";

    if (body) {
      if (body instanceof ArrayBuffer) {
        payloadArrayBuffer = body;
      } else if (body instanceof Blob || body instanceof File) {
        payloadArrayBuffer = await body.arrayBuffer();
      } else if (typeof body === "string") {
        if (body.startsWith("data:")) {
          // Convert base64 data URL to ArrayBuffer
          const base64Data = body.split(",")[1];
          const binaryStr = window.atob(base64Data);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          payloadArrayBuffer = bytes.buffer;
        } else {
          payloadArrayBuffer = new TextEncoder().encode(body).buffer;
        }
      }
    }

    if (payloadArrayBuffer) {
      payloadHash = await sha256Hex(payloadArrayBuffer);
    } else {
      payloadHash = await sha256Hex("");
    }

    const headers = {
      host: host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": isoDate,
      ...extraHeaders
    };

    // Sorted header keys
    const sortedHeaderKeys = Object.keys(headers).sort();
    const canonicalHeaders = sortedHeaderKeys.map((k) => `${k.toLowerCase()}:${headers[k].trim()}\n`).join("");
    const signedHeaders = sortedHeaderKeys.map((k) => k.toLowerCase()).join(";");

    // Canonical Request
    const canonicalRequest = [
      method.toUpperCase(),
      path,
      "", // query string
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join("\n");

    const canonicalRequestHash = await sha256Hex(canonicalRequest);

    // String to Sign
    const credentialScope = `${dateStr}/${REGION}/${SERVICE}/aws4_request`;
    const stringToSign = ["AWS4-HMAC-SHA256", isoDate, credentialScope, canonicalRequestHash].join("\n");

    // Calculate Signature
    const signingKey = await getSigningKey(SECRET_ACCESS_KEY, dateStr, REGION, SERVICE);
    const signatureBuffer = await hmac(signingKey, stringToSign);
    const signature = bufferToHex(signatureBuffer);

    // Authorization Header
    const authHeader = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const requestHeaders = {
      ...headers,
      Authorization: authHeader
    };

    const res = await fetch(url, {
      method: method.toUpperCase(),
      headers: requestHeaders,
      body: payloadArrayBuffer
    });

    if (!res.ok && res.status !== 204) {
      const errText = await res.text();
      console.error(`R2 API Error [${res.status}]:`, errText);
      return { data: null, error: new Error(`R2 Error ${res.status}: ${errText}`) };
    }

    return { data: { url, status: res.status }, error: null };
  } catch (err) {
    console.error("r2Fetch Exception:", err);
    return { data: null, error: err };
  }
}

/**
 * Upload file to Cloudflare R2 bucket (CREATE / UPDATE)
 */
export async function uploadFile(bucket, filePath, file) {
  const cleanPath = filePath ? filePath.replace(/^\//, "") : "";
  const fullPath = bucket && !cleanPath.startsWith(bucket) ? `${bucket}/${cleanPath}` : cleanPath;
  const contentType = (file && file.type) || (typeof file === "string" ? "text/plain" : "application/octet-stream");

  const { error } = await r2Fetch("PUT", DEFAULT_BUCKET, fullPath, file, {
    "content-type": contentType
  });

  if (error) {
    return { data: null, error };
  }

  const publicUrl = `${ENDPOINT}/${DEFAULT_BUCKET}/${fullPath}`;
  return { data: { path: fullPath, publicUrl }, error: null };
}

/**
 * Get public URL for object (READ)
 */
export function getPublicUrl(bucket, filePath) {
  const cleanPath = filePath ? filePath.replace(/^\//, "") : "";
  const fullPath = bucket && !cleanPath.startsWith(bucket) ? `${bucket}/${cleanPath}` : cleanPath;
  const publicUrl = `${ENDPOINT}/${DEFAULT_BUCKET}/${fullPath}`;
  return { data: { publicUrl } };
}

/**
 * Download or retrieve object metadata from R2 (READ)
 */
export async function downloadFile(bucket, filePath) {
  const cleanPath = filePath ? filePath.replace(/^\//, "") : "";
  const fullPath = bucket && !cleanPath.startsWith(bucket) ? `${bucket}/${cleanPath}` : cleanPath;
  return await r2Fetch("GET", DEFAULT_BUCKET, fullPath);
}

/**
 * Delete file from Cloudflare R2 bucket (DELETE)
 */
export async function deleteFile(bucket, filePath) {
  const cleanPath = filePath ? filePath.replace(/^\//, "") : "";
  const fullPath = bucket && !cleanPath.startsWith(bucket) ? `${bucket}/${cleanPath}` : cleanPath;
  return await r2Fetch("DELETE", DEFAULT_BUCKET, fullPath);
}

/**
 * List files in bucket with optional prefix (READ LIST)
 */
export async function listFiles(bucket, prefix = "") {
  const cleanPrefix = prefix ? prefix.replace(/^\//, "") : "";
  const fullPrefix = bucket ? `${bucket}/${cleanPrefix}` : cleanPrefix;
  const query = fullPrefix ? `?prefix=${encodeURIComponent(fullPrefix)}` : "";
  return await r2Fetch("GET", DEFAULT_BUCKET, query);
}
