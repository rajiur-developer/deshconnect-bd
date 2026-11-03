export function isR2PublicMediaUrl(urlValue: string, key: string): boolean {
  const configured = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.trim();
  if (!configured || !urlValue || !key) return false;
  try {
    const base = new URL(configured);
    const url = new URL(urlValue);
    const basePath = base.pathname.replace(/\/+$/, "");
    const expectedPath = `${basePath}/${key.split("/").map(encodeURIComponent).join("/")}`;
    return url.origin === base.origin
      && url.pathname === expectedPath
      && !url.search
      && !url.hash;
  } catch {
    return false;
  }
}

export function isTrustedInsForgeImageUrl(
  urlValue: string,
  key: string,
  buckets: readonly string[],
): boolean {
  if (!urlValue || !key) return false;
  const configured = process.env.NEXT_PUBLIC_INSFORGE_URL?.trim().replace(/\/+$/, "");
  if (!configured) return false;
  try {
    const url = new URL(urlValue);
    const base = new URL(configured);
    if (url.origin !== base.origin) return false;
    const match = url.pathname.match(/^\/api\/storage\/buckets\/([^/]+)\/objects\/(.+)$/);
    if (!match) return false;
    const bucket = decodeURIComponent(match[1]);
    const objectKey = decodeURIComponent(match[2]);
    return buckets.includes(bucket) && objectKey === key;
  } catch {
    return false;
  }
}

export function isTrustedPublicImageUrl(
  urlValue: string,
  key: string,
  buckets: readonly string[] = ["profile-images", "community-post-images"],
): boolean {
  return isR2PublicMediaUrl(urlValue, key) || isTrustedInsForgeImageUrl(urlValue, key, buckets);
}
