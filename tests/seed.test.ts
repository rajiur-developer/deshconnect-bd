import { describe, expect, it } from "vitest";
import { seedDatabase } from "../src/data/seed";
import { slugify } from "../src/lib/utils";

describe("seed", () => {
  it("creates seed data with expected structure", () => {
    const db = seedDatabase() as unknown as Record<string, { length: number }>;
    expect(db.divisions.length).toBeGreaterThan(0);
    expect(db.districts.length).toBeGreaterThan(0);
    expect(db.upazilas.length).toBeGreaterThan(0);
    expect(db.users.length).toBeGreaterThan(0);
    expect(db.places.length).toBeGreaterThan(0);
    expect(db.institutions.length).toBeGreaterThan(0);
    expect(db.businesses.length).toBeGreaterThan(0);
    expect(db.government_services.length).toBeGreaterThan(0);
    expect(db.news.length).toBeGreaterThan(0);
    expect(db.reviews.length).toBeGreaterThan(0);
    expect(db.posts.length).toBeGreaterThan(0);
    expect(db.comments.length).toBeGreaterThan(0);
    expect(db.notifications.length).toBeGreaterThan(0);
    expect(db.donors.length).toBeGreaterThan(0);
    expect(db.blood_requests.length).toBeGreaterThan(0);
    expect(db.saved.length).toBeGreaterThan(0);
    expect(db.connections.length).toBeGreaterThan(0);
    expect(db.conversations.length).toBeGreaterThan(0);
    expect(db.messages.length).toBeGreaterThan(0);
    expect(db.audit_logs.length).toBeGreaterThan(0);
  });

  it("slugify produces URL-friendly slugs", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("Hello   World!!!")).toBe("hello-world");
    expect(slugify("Test-Item 123")).toBe("test-item-123");
  });
});