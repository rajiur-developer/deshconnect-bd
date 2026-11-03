import { afterEach, describe, expect, it } from "vitest";
import { isR2PublicMediaUrl, isTrustedPublicImageUrl } from "../../src/lib/storage/media-url";

describe("R2 public media URLs", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    delete process.env.NEXT_PUBLIC_INSFORGE_URL;
  });

  it("accepts an object URL on the configured CDN path", () => {
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://media.example/assets";
    const key = "user-1/community/post.webp";
    expect(isR2PublicMediaUrl("https://media.example/assets/user-1/community/post.webp", key)).toBe(true);
    expect(isTrustedPublicImageUrl("https://media.example/assets/user-1/community/post.webp", key)).toBe(true);
  });

  it("rejects a different host, key, query string, or path", () => {
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://media.example/assets";
    const key = "user-1/community/post.webp";
    expect(isR2PublicMediaUrl("https://other.example/assets/user-1/community/post.webp", key)).toBe(false);
    expect(isR2PublicMediaUrl("https://media.example/assets/user-2/community/post.webp", key)).toBe(false);
    expect(isR2PublicMediaUrl("https://media.example/assets/user-1/community/post.webp?download=1", key)).toBe(false);
  });

  it("continues to accept existing InsForge Storage URLs", () => {
    process.env.NEXT_PUBLIC_INSFORGE_URL = "https://backend.example";
    const key = "user-1/post.webp";
    const url = "https://backend.example/api/storage/buckets/community-post-images/objects/user-1%2Fpost.webp";
    expect(isTrustedPublicImageUrl(url, key, ["community-post-images"])).toBe(true);
  });
});
