import { afterEach, describe, expect, it } from "vitest";
import { isValidAdminDirectoryImageUrl, isValidAdminPlaceImageUrl } from "@/features/admin/place-image";

describe("admin place image URLs", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_INSFORGE_URL;
    delete process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  });

  it("accepts an image uploaded to the current admin's place folder", () => {
    process.env.NEXT_PUBLIC_INSFORGE_URL = "https://backend.example";

    expect(isValidAdminPlaceImageUrl(
      "https://backend.example/api/storage/buckets/community-post-images/objects/admin-1%2Fplaces%2Fimage.jpg",
      "admin-1",
    )).toBe(true);
    expect(isValidAdminPlaceImageUrl(
      "https://backend.example/api/storage/buckets/community-post-images/objects/admin-1/places/image.jpg",
      "admin-1",
    )).toBe(true);
  });

  it("accepts images served from the configured R2 CDN domain", () => {
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL = "https://media.example/assets";

    expect(isValidAdminPlaceImageUrl(
      "https://media.example/assets/admin-1/places/image.webp",
      "admin-1",
    )).toBe(true);
    expect(isValidAdminPlaceImageUrl(
      "https://media.example/assets/admin-2/places/image.webp",
      "admin-1",
    )).toBe(false);
  });

  it("rejects external, cross-user, and non-storage image URLs", () => {
    process.env.NEXT_PUBLIC_INSFORGE_URL = "https://backend.example";

    expect(isValidAdminPlaceImageUrl("https://other.example/image.jpg", "admin-1")).toBe(false);
    expect(isValidAdminPlaceImageUrl(
      "https://backend.example/api/storage/buckets/community-post-images/objects/admin-2/places/image.jpg",
      "admin-1",
    )).toBe(false);
    expect(isValidAdminPlaceImageUrl("data:image/jpeg;base64,abc", "admin-1")).toBe(false);
  });

  it("accepts institution images only from the current admin's institution folder", () => {
    process.env.NEXT_PUBLIC_INSFORGE_URL = "https://backend.example";

    expect(isValidAdminDirectoryImageUrl(
      "https://backend.example/api/storage/buckets/community-post-images/objects/admin-1%2Finstitutions%2Fimage.jpg",
      "admin-1",
      "institutions",
    )).toBe(true);
    expect(isValidAdminDirectoryImageUrl(
      "https://backend.example/api/storage/buckets/community-post-images/objects/admin-1%2Fplaces%2Fimage.jpg",
      "admin-1",
      "institutions",
    )).toBe(false);
  });
});
