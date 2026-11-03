import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  createR2UploadUrl,
  deleteR2Object,
  getR2PublicUrl,
  isR2Configured,
  verifyR2Object,
} from "@/lib/storage/r2";

export const runtime = "nodejs";

type Purpose = "profile" | "community" | "news" | "directory";
type DirectoryFolder = "places" | "institutions" | "hospitals";
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function safeKeyForUser(key: string, userId: string, purpose: Purpose, directoryFolder?: DirectoryFolder): boolean {
  const parts = key.split("/");
  if (parts.some((part) => !part || part === "." || part === "..") || parts[0] !== userId) return false;
  if (purpose === "profile" || purpose === "community") return parts.length === 2;
  if (purpose === "news") return parts.length === 3 && parts[1] === "news";
  return parts.length === 3 && Boolean(directoryFolder) && parts[1] === directoryFolder;
}

function extensionFor(contentType: string): string {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  return "webp";
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Please sign in to upload an image.", 401);
  if (!isR2Configured()) return jsonError("Cloudflare R2 is not configured yet.", 503);

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonError("Invalid upload request.");
  }

  const action = body.action;
  const purpose = body.purpose as Purpose;
  const directoryFolder = body.directoryFolder as DirectoryFolder | undefined;
  if (!["profile", "community", "news", "directory"].includes(purpose)) return jsonError("Invalid image purpose.");
  if (purpose === "directory" && !["places", "institutions", "hospitals", "businesses", "news"].includes(directoryFolder ?? "")) {
    return jsonError("Choose a valid directory image category.");
  }
  if (purpose === "directory" && user.role !== "admin" && user.role !== "moderator") {
    return jsonError("Only staff can upload directory images.", 403);
  }

  if (action === "create") {
    const contentType = String(body.contentType ?? "").toLowerCase();
    const size = Number(body.size ?? 0);
    const maxBytes = purpose === "community" ? 3 * 1024 * 1024 : 5 * 1024 * 1024;
    if (!IMAGE_TYPES.has(contentType) || !Number.isSafeInteger(size) || size < 1 || size > maxBytes) {
      return jsonError(`Choose a supported image up to ${Math.round(maxBytes / 1024 / 1024)} MB.`);
    }
    const folder = purpose === "news" ? "news" : purpose === "directory" ? directoryFolder : "";
    const key = folder
      ? `${user.id}/${folder}/${crypto.randomUUID()}.${extensionFor(contentType)}`
      : `${user.id}/${crypto.randomUUID()}.${extensionFor(contentType)}`;
    const signed = createR2UploadUrl(key, contentType);
    return NextResponse.json({ key, uploadUrl: signed.uploadUrl, headers: signed.headers });
  }

  const key = String(body.key ?? "");
  if (!safeKeyForUser(key, user.id, purpose, directoryFolder)) return jsonError("This upload does not belong to your account.", 403);

  if (action === "complete") {
    const expectedType = String(body.contentType ?? "").toLowerCase();
    if (!IMAGE_TYPES.has(expectedType)) return jsonError("Unsupported image type.");
    try {
      const actual = await verifyR2Object(key);
      const maxBytes = purpose === "community" ? 3 * 1024 * 1024 : 5 * 1024 * 1024;
      if (actual.size > maxBytes || actual.contentType !== expectedType) {
        await deleteR2Object(key).catch(() => undefined);
        return jsonError("The uploaded image failed file verification.");
      }
      return NextResponse.json({ key, url: getR2PublicUrl(key) });
    } catch {
      return jsonError("The uploaded image could not be verified. Please try again.", 422);
    }
  }

  if (action === "delete") {
    try {
      await deleteR2Object(key);
      return NextResponse.json({ deleted: true });
    } catch {
      return jsonError("Could not delete this image.", 502);
    }
  }

  return jsonError("Invalid upload action.");
}
