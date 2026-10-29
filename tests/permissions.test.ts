import { describe, expect, it } from "vitest";
import { can, isStaff, rolePermissions } from "../src/lib/auth/permissions";

describe("role permissions", () => {
  it("allows actions assigned to a role", () => {
    expect(can("admin", "users:manage")).toBe(true);
    expect(can("moderator", "moderation:posts")).toBe(true);
    expect(can("user", "moderation:posts")).toBe(false);
  });

  it("adds only known permission overrides", () => {
    expect(rolePermissions("user", { user: ["news:publish", "unknown:action"] })).toEqual(["news:publish"]);
  });

  it("identifies staff roles", () => {
    expect(isStaff("admin")).toBe(true);
    expect(isStaff("moderator")).toBe(true);
    expect(isStaff("user")).toBe(false);
  });
});