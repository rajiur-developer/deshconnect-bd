import { COMMUNITY_POST_IMAGE_BUCKET } from "@/features/account/constants";

export function isValidAdminDirectoryImageUrl(imageUrl: string, userId: string, folder: "places" | "institutions" | "hospitals"): boolean {
  try {
    const url = new URL(imageUrl);
    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
    if (!baseUrl || url.origin !== new URL(baseUrl).origin) return false;

    const prefix = `/api/storage/buckets/${COMMUNITY_POST_IMAGE_BUCKET}/objects/`;
    if (!url.pathname.startsWith(prefix)) return false;

    const key = decodeURIComponent(url.pathname.slice(prefix.length));
    const folderPrefix = `${userId}/${folder}/`;
    return key.startsWith(folderPrefix)
      && key.slice(folderPrefix.length).length > 0
      && !key.slice(folderPrefix.length).includes("/");
  } catch {
    return false;
  }
}

export function isValidAdminPlaceImageUrl(imageUrl: string, userId: string): boolean {
  return isValidAdminDirectoryImageUrl(imageUrl, userId, "places");
}
