import { COMMUNITY_POST_IMAGE_BUCKET } from "@/features/account/constants";
import { isTrustedPublicImageUrl } from "@/lib/storage/media-url";

export function isValidAdminDirectoryImageUrl(imageUrl: string, userId: string, folder: "places" | "institutions" | "hospitals"): boolean {
  try {
    const url = new URL(imageUrl);
    let key = "";
    const r2BaseValue = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim();
    if (r2BaseValue) {
      const base = new URL(r2BaseValue);
      const prefix = base.pathname.replace(/\/+$/, "");
      if (url.origin === base.origin && url.pathname.startsWith(`${prefix}/`)) {
        key = decodeURIComponent(url.pathname.slice(prefix.length + 1));
      }
    }

    if (!key) {
      const baseValue = process.env.NEXT_PUBLIC_INSFORGE_URL?.trim();
      if (!baseValue) return false;
      const base = new URL(baseValue);
      const prefix = `/api/storage/buckets/${COMMUNITY_POST_IMAGE_BUCKET}/objects/`;
      if (url.origin !== base.origin || !url.pathname.startsWith(prefix)) return false;
      key = decodeURIComponent(url.pathname.slice(prefix.length));
    }

    const folderPrefix = `${userId}/${folder}/`;
    return isTrustedPublicImageUrl(imageUrl, key, [COMMUNITY_POST_IMAGE_BUCKET])
      && key.startsWith(folderPrefix)
      && key.slice(folderPrefix.length).length > 0
      && !key.slice(folderPrefix.length).includes("/");
  } catch {
    return false;
  }
}

export function isValidAdminPlaceImageUrl(imageUrl: string, userId: string): boolean {
  return isValidAdminDirectoryImageUrl(imageUrl, userId, "places");
}
