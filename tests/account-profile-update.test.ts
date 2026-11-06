import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUser = vi.fn();
const createServerClient = vi.fn();
const revalidatePath = vi.fn();
const recordAudit = vi.fn();

vi.mock("@/lib/auth/current-user", () => ({ requireUser }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/headers", () => ({ cookies: async () => ({}) }));
vi.mock("@/lib/supabase/server", () => ({ createServerClient }));
vi.mock("@/lib/insforge", () => ({ insforge: {} }));
vi.mock("@/services/messaging", () => ({ cancelConnection: vi.fn(), getOrCreateConversation: vi.fn(), requestConnection: vi.fn(), respondToConnection: vi.fn(), sendMessage: vi.fn() }));
vi.mock("@/services/notifications", () => ({ markAllNotificationsRead: vi.fn(), markNotificationRead: vi.fn() }));
vi.mock("@/services/community", () => ({ deletePost: vi.fn() }));
vi.mock("@/services/audit", () => ({ recordAudit }));

function makeClient() {
  const query: any = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    maybeSingle: vi.fn(async () => ({ data: { avatar_key: null }, error: null })),
    update: vi.fn(() => query),
    then: (resolve: (value: { error: null }) => unknown, reject: (reason: unknown) => unknown) =>
      Promise.resolve({ error: null }).then(resolve, reject),
  };
  createServerClient.mockReturnValue({ database: { from: vi.fn(() => query) } });
}

function makeFormData() {
  const formData = new FormData();
  formData.set("fullName", "Updated User");
  formData.set("bio", "");
  formData.set("phone", "");
  return formData;
}

describe("profile update action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUser.mockResolvedValue({ id: "user-id", username: "user" });
    recordAudit.mockResolvedValue(undefined);
    makeClient();
  });

  it("keeps a successful profile update successful if audit logging fails", async () => {
    const auditError = new Error("audit insert failed");
    recordAudit.mockRejectedValue(auditError);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { updateProfileAction } = await import("@/features/account/actions");

    await expect(updateProfileAction({}, makeFormData())).resolves.toEqual({
      success: "Profile updated, but the activity log could not be saved.",
    });

    expect(consoleError).toHaveBeenCalledWith(
      "Profile updated, but its audit log could not be recorded.",
      auditError,
    );
    expect(revalidatePath).toHaveBeenCalledWith("/profile");
    consoleError.mockRestore();
  });

  it("returns the normal success message when the profile and audit log save", async () => {
    const { updateProfileAction } = await import("@/features/account/actions");

    await expect(updateProfileAction({}, makeFormData())).resolves.toEqual({
      success: "Profile updated.",
    });
  });
});
