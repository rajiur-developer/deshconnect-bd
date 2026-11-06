import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUser = vi.fn();
const createServerClient = vi.fn();
const createPublicClient = vi.fn();
const revalidatePath = vi.fn();
const queryState = vi.hoisted(() => ({ target: null as any, existing: [] as any[], inserted: null as any, updated: null as any, updateError: null as any, insertedError: null as any, insertedPayload: null as any }));

vi.mock("@/lib/auth/current-user", () => ({ requireUser }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/headers", () => ({ cookies: async () => ({}) }));
vi.mock("@/lib/supabase/server", () => ({ createServerClient, createPublicClient }));
vi.mock("@/lib/insforge", () => ({ insforge: {} }));
vi.mock("@/services/messaging", () => ({ cancelConnection: vi.fn(), getOrCreateConversation: vi.fn(), requestConnection: vi.fn(), respondToConnection: vi.fn(), sendMessage: vi.fn() }));
vi.mock("@/services/notifications", () => ({ markAllNotificationsRead: vi.fn(), markNotificationRead: vi.fn() }));
vi.mock("@/services/community", () => ({ deletePost: vi.fn() }));
vi.mock("@/services/audit", () => ({ recordAudit: vi.fn() }));

function makeClient() {
  const from = vi.fn((table: string) => {
    let operation = "select";
    const query: any = {
      select: vi.fn(() => query),
      eq: vi.fn(() => query),
      or: vi.fn(() => query),
      limit: vi.fn(async () => ({ data: queryState.existing, error: null })),
      maybeSingle: vi.fn(async () => {
        if (table === "public_profiles") return { data: queryState.target, error: null };
        if (operation === "insert") return { data: queryState.inserted, error: queryState.insertedError };
        return { data: queryState.updated, error: queryState.updateError };
      }),
      insert: vi.fn((rows: any) => { operation = "insert"; queryState.insertedPayload = rows; return query; }),
      update: vi.fn(() => { operation = "update"; return query; }),
    };
    return query;
  });
  const client = { database: { from } };
  createServerClient.mockReturnValue(client);
  createPublicClient.mockReturnValue({ from });
  return { client, from };
}

const requester = { id: "sender-id" };

describe("connection request workflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryState.target = { id: "recipient-id" };
    queryState.existing = [];
    queryState.inserted = { id: "request-id", status: "pending", requester_id: "sender-id", addressee_id: "recipient-id" };
    queryState.updated = { id: "request-id", status: "accepted", addressee_id: "recipient-id" };
    queryState.insertedError = null;
    queryState.insertedPayload = null;
    queryState.updateError = null;
    requireUser.mockResolvedValue(requester);
    makeClient();
  });

  it("persists a pending request for the selected recipient before reporting success", async () => {
    const { from } = makeClient();
    const { requestConnectionAction } = await import("@/features/account/actions");

    await expect(requestConnectionAction("recipient")).resolves.toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("public_profiles");
    expect(from).toHaveBeenCalledWith("connections");
    expect(queryState.insertedPayload).toEqual([{ requester_id: "sender-id", addressee_id: "recipient-id", status: "pending" }]);
  });

  it("does not insert a duplicate request", async () => {
    const { from } = makeClient();
    queryState.existing = [{ id: "request-id", status: "pending", requester_id: "sender-id", addressee_id: "recipient-id" }];
    const { requestConnectionAction } = await import("@/features/account/actions");

    await expect(requestConnectionAction("recipient")).resolves.toMatchObject({ ok: false });
    expect(from).toHaveBeenCalledTimes(2);
  });

  it("reports success for acceptance only after the recipient's row is updated", async () => {
    const { from } = makeClient();
    requireUser.mockResolvedValue({ id: "recipient-id" });
    const { respondConnectionAction } = await import("@/features/account/actions");

    await expect(respondConnectionAction("request-id", "accepted")).resolves.toEqual({ ok: true });
    expect(from).toHaveBeenCalledWith("connections");
  });

  it("does not report success when no pending request was updated", async () => {
    queryState.updated = null;
    requireUser.mockResolvedValue({ id: "recipient-id" });
    const { respondConnectionAction } = await import("@/features/account/actions");

    await expect(respondConnectionAction("request-id", "rejected")).resolves.toEqual({ ok: false });
  });
});