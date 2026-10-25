// @ts-nocheck
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockInsforgeSelectMany } = vi.hoisted(() => ({
  mockInsforgeSelectMany: vi.fn(),
}));

vi.mock("../src/lib/insforge", () => ({
  insforgeGet: vi.fn(),
  insforgeInsert: vi.fn(),
  insforgeUpdate: vi.fn(),
  insforgeDelete: vi.fn(),
  insforgeSelectOne: vi.fn(),
  insforgeSelectMany: mockInsforgeSelectMany,
}));

import { insforgeListAdminInstitutions, listHospitals } from "../src/services/institutions";

describe("institution listings", () => {
  beforeEach(() => {
    mockInsforgeSelectMany.mockReset();
    mockInsforgeSelectMany.mockResolvedValue({
      data: [{
        id: "inst-1",
        slug: "dhaka-general-hospital",
        name: "Dhaka General Hospital",
        category: "hospital",
        description: "A busy urban hospital.",
        address: "Dhaka",
        phone: null,
        email: null,
        website: null,
        emergency_phone: null,
        latitude: null,
        longitude: null,
        image: "/images/institutions/i1.svg",
        verification: "verified",
        source: "OpenStreetMap",
        division_id: "div-1",
        district_id: "dist-1",
        upazila_id: "upa-1",
        status: "published",
        last_checked_at: null,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      }],
      count: 1,
      error: null,
    });
  });

  it("includes health centres alongside hospitals in the hospital listing", async () => {
    await listHospitals({});

    expect(mockInsforgeSelectMany).toHaveBeenCalledWith(
      "institutions",
      expect.objectContaining({
        category: "in.(hospital,health-centre)",
        status: "eq.published",
      }),
    );
  });

  it("lists every educational institution category in the admin listing", async () => {
    await insforgeListAdminInstitutions({
      categories: ["school", "college", "madrasah", "university", "kindergarten", "education-centre"],
    });

    expect(mockInsforgeSelectMany).toHaveBeenCalledWith(
      "institutions",
      expect.objectContaining({
        category: "in.(school,college,madrasah,university,kindergarten,education-centre)",
      }),
    );
  });
});
