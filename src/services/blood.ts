import "server-only";

import { insforge } from "@/lib/insforge";
import { insforgeGet, insforgeInsert, insforgeUpdate, insforgeDelete, insforgeSelectOne, insforgeSelectMany } from "@/lib/insforge";

export async function insforgeListPublicDonors(query: {
  q?: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  bloodGroup?: string;
  sort?: "relevance" | "name" | "newest" | "rating";
}) {
  const pageSize = 500;
  let donorQuery = insforge.database
    .from("public_blood_donors")
    .select("id,user_id,blood_group,availability,preferred_contact,donation_count,consent_listed,division_id,district_id,upazila_id,created_at,updated_at,phone,whatsapp")
    .eq("consent_listed", true)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });
  if (query.divisionId) donorQuery = donorQuery.eq("division_id", query.divisionId);
  if (query.districtId) donorQuery = donorQuery.eq("district_id", query.districtId);
  if (query.upazilaId) donorQuery = donorQuery.eq("upazila_id", query.upazilaId);
  if (query.bloodGroup) donorQuery = donorQuery.eq("blood_group", query.bloodGroup);
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await donorQuery.range(offset, offset + pageSize - 1);
    if (error) throw new Error(`Could not load public blood donors: ${error.message}`);
    rows.push(...(data ?? []));
    if ((data ?? []).length < pageSize) break;
  }
  const userIds = [...new Set(rows.map((row: any) => row.user_id).filter(Boolean))];
  const profileResults = await Promise.all(
    Array.from({ length: Math.ceil(userIds.length / 100) }, (_, index) =>
      insforge.database.from("public_profiles").select("id,full_name").in("id", userIds.slice(index * 100, (index + 1) * 100)).limit(100),
    ),
  );
  for (const result of profileResults) {
    if (result.error) throw new Error(`Could not load donor profile names: ${result.error.message}`);
  }
  const profiles = profileResults.flatMap((result) => result.data ?? []);
  const names = new Map((profiles || []).map((profile: any) => [profile.id, profile.full_name]));
  const donors = rows.map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    fullName: names.get(r.user_id) || "Voluntary blood donor",
    bloodGroup: r.blood_group,
    availability: r.availability,
    preferredContact: r.preferred_contact,
    phone: r.phone ?? null,
    whatsapp: r.whatsapp ?? null,
    donationCount: r.donation_count,
    consentListed: r.consent_listed,
    divisionId: r.division_id,
    districtId: r.district_id,
    upazilaId: r.upazila_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
  const term = query.q?.trim().toLocaleLowerCase();
  const filtered = term
    ? donors.filter((donor: any) => [donor.fullName, donor.bloodGroup, donor.availability]
        .some((value) => String(value ?? "").toLocaleLowerCase().includes(term)))
    : donors;
  if (query.sort === "name") filtered.sort((a: any, b: any) => a.fullName.localeCompare(b.fullName));
  else filtered.sort((a: any, b: any) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));
  return filtered;
}

export async function insforgeListBloodRequests(query: {
  q?: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  bloodGroup?: string;
  status?: string;
  sort?: "relevance" | "name" | "newest" | "rating";
}) {
  const params: Record<string, string> = { status: `eq.${query.status ?? "active"}`, order: "created_at.desc" };
  if (query.divisionId) params["division_id"] = `eq.${query.divisionId}`;
  if (query.districtId) params["district_id"] = `eq.${query.districtId}`;
  if (query.upazilaId) params["upazila_id"] = `eq.${query.upazilaId}`;
  if (query.bloodGroup) params["blood_group"] = `eq.${query.bloodGroup}`;
  const { data } = await insforgeSelectMany("blood_requests", params);
  const requests = (data || []).map((r: any) => ({
    id: r.id,
    requesterId: r.requester_id,
    bloodGroup: r.blood_group,
    units: r.units,
    patient: r.patient,
    hospital: r.hospital,
    neededBy: r.needed_by,
    phone: r.phone ?? null,
    whatsapp: r.whatsapp ?? null,
    notes: r.notes,
    status: r.status,
    divisionId: r.division_id,
    districtId: r.district_id,
    upazilaId: r.upazila_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
  const term = query.q?.trim().toLocaleLowerCase();
  const filtered = term
    ? requests.filter((request: any) => [request.patient, request.hospital, request.notes, request.bloodGroup]
        .some((value) => String(value ?? "").toLocaleLowerCase().includes(term)))
    : requests;
  if (query.sort === "name") filtered.sort((a: any, b: any) => String(a.hospital ?? "").localeCompare(String(b.hospital ?? "")));
  else filtered.sort((a: any, b: any) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));
  return filtered;
}

export async function listUserBloodRequests(userId: string) {
  const { data } = await insforgeSelectMany("blood_requests", { requester_id: `eq.${userId}`, order: "created_at.desc" });
  return data.map((r: any) => ({ id: r.id, requesterId: r.requester_id, bloodGroup: r.blood_group, units: r.units, patient: r.patient, hospital: r.hospital, neededBy: r.needed_by, phone: r.phone ?? null, whatsapp: r.whatsapp ?? null, notes: r.notes, status: r.status, divisionId: r.division_id, districtId: r.district_id, upazilaId: r.upazila_id, createdAt: r.created_at, updatedAt: r.updated_at }));
}
export async function setBloodRequestStatus(id: string, status: string) {
  const { error } = await insforgeUpdate("blood_requests", id, { status, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function insforgeGetDonorForUser(userId: string) {
  const data = await insforgeSelectOne("blood_donors", { user_id: `eq.${userId}` });
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    bloodGroup: data.blood_group,
    availability: data.availability,
    preferredContact: data.preferred_contact,
    contactValue: data.contact_value,
    phone: data.phone ?? null,
    whatsapp: data.whatsapp ?? null,
    lastDonationAt: data.last_donation_at,
    donationCount: data.donation_count,
    notes: data.notes,
    consentListed: data.consent_listed,
    consentContact: data.consent_contact,
    consentExpiry: data.consent_expiry,
    archivedAt: data.archived_at ?? null,
    divisionId: data.division_id,
    districtId: data.district_id,
    upazilaId: data.upazila_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function insforgeUpsertDonor(input: {
  userId: string;
  bloodGroup: string;
  availability: string;
  preferredContact: string;
  contactValue: string;
  phone?: string;
  whatsapp?: string;
  lastDonationAt?: string;
  notes?: string;
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  consentListed: boolean;
  consentContact: boolean;
}) {
  const { data: existing, error: lookupError } = await insforge.database
    .from("blood_donors")
    .select("*")
    .eq("user_id", input.userId)
    .maybeSingle();
  if (lookupError) throw lookupError;
  const record = {
    user_id: input.userId,
    blood_group: input.bloodGroup,
    availability: input.availability,
    preferred_contact: input.preferredContact,
    contact_value: input.contactValue,
    phone: input.phone ?? null,
    whatsapp: input.whatsapp ?? null,
    last_donation_at: input.lastDonationAt ?? null,
    notes: input.notes ?? null,
    division_id: input.divisionId ?? null,
    district_id: input.districtId ?? null,
    upazila_id: input.upazilaId ?? null,
    consent_listed: input.consentListed,
    consent_contact: input.consentContact,
    consent_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  };
  if (existing) {
    const { data, error } = await insforge.database
      .from("blood_donors")
      .update(record)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await insforge.database
    .from("blood_donors")
    .insert([record])
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function insforgeCreateBloodRequest(input: {
  requesterId: string;
  bloodGroup: string;
  units: number;
  patient?: string | null;
  hospital: string;
  neededBy: string;
  phone: string;
  whatsapp: string;
  notes?: string | null;
  location?: { divisionId?: string | null; districtId?: string | null; upazilaId?: string | null };
}) {
  const { data, error } = await insforgeInsert("blood_requests", {
    requester_id: input.requesterId,
    blood_group: input.bloodGroup,
    units: input.units,
    patient: input.patient,
    hospital: input.hospital,
    needed_by: input.neededBy,
    phone: input.phone,
    whatsapp: input.whatsapp,
    notes: input.notes,
    status: "under_review",
    division_id: input.location?.divisionId ?? null,
    district_id: input.location?.districtId ?? null,
    upazila_id: input.location?.upazilaId ?? null,
  });
  if (error) throw error;
  return data;
}

export async function insforgeCancelOwnBloodRequest(requestId: string, userId: string) {
  const { data, error } = await insforgeUpdate("blood_requests", requestId, {
    status: "cancelled",
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return (data || []).length > 0;
}

export async function insforgeReleaseDonorContact(donorId: string, requesterId: string) {
  const donor = await insforgeSelectOne("blood_donors", {
    id: `eq.${donorId}`,
    consent_listed: "eq.true",
    consent_contact: "eq.true",
  });
  if (!donor) return null;

  const today = new Date().toISOString().slice(0, 10);
  const consentExpiry = new Date(donor.consent_expiry).toISOString().slice(0, 10);
  if (consentExpiry < today) return null;

  const { data: requests } = await insforgeSelectMany("blood_requests", {
    requester_id: `eq.${requesterId}`,
    status: "eq.active",
    blood_group: `eq.${donor.blood_group}`,
    needed_by: `gte.${today}`,
  });
  if (!requests.length) return null;

  return donor.contact_value;
}

export async function insforgeReleaseRequesterContact(requestId: string, viewerId: string) {
  const request = await insforgeSelectOne("blood_requests", {
    id: `eq.${requestId}`,
    status: "eq.active",
  });
  if (!request) return null;

  const requester = request.profiles;
  if (!requester?.phone) return null;

  const today = new Date().toISOString().slice(0, 10);
  const donor = await insforgeSelectOne("blood_donors", {
    user_id: `eq.${viewerId}`,
    consent_listed: "eq.true",
  });
  const viewerRequest = await insforgeSelectOne("blood_requests", {
    requester_id: `eq.${viewerId}`,
    status: "eq.active",
    blood_group: `eq.${request.blood_group}`,
    needed_by: `gte.${today}`,
  });

  if (!donor && !viewerRequest) return null;
  return requester.phone;
}

// Wrapper exports for backward compatibility
export const upsertDonor = insforgeUpsertDonor;
export const createBloodRequest = insforgeCreateBloodRequest;
export const cancelOwnBloodRequest = insforgeCancelOwnBloodRequest;
export const releaseDonorContact = insforgeReleaseDonorContact;
export const releaseRequesterContact = insforgeReleaseRequesterContact;
export const listPublicDonors = insforgeListPublicDonors;
export const listBloodRequests = insforgeListBloodRequests;
export const getDonorForUser = insforgeGetDonorForUser;
