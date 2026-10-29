import type { BloodGroup } from "./auth"; import type { LocationRef } from "./location";
export type DonorAvailability = "available" | "busy" | "unavailable"; export type ContactMethod = "phone" | "sms" | "email" | "in-app";
export type BloodRequestStatus =
| "active"
| "fulfilled"
| "cancelled"
| "expired"
| "under_review";
/**
* Donor records are owner-controlled. Contact details are stored but only
* released through the coordination flow — never in public listings.
*/ export interface BloodDonor extends LocationRef {
id: string;
userId: string;
bloodGroup: BloodGroup;
availability: DonorAvailability;
preferredContact: ContactMethod;
phone?: string | null;
whatsapp?: string | null;
/** Only shared with an approved requester via the coordination response. */
contactValue: string;
lastDonationAt?: string | null;
donationCount: number;
notes?: string | null;
/** Explicit consent flags — visibility follows these, never defaults. */
consentListed: boolean;
consentContact: boolean;
consentExpiry: string;
archivedAt?: string | null;
createdAt: string;
updatedAt: string; }
export interface BloodRequest extends LocationRef {
id: string;
requesterId: string;
bloodGroup: BloodGroup;
units: number;
patient?: string | null;
hospital: string;
neededBy: string;
phone?: string | null;
whatsapp?: string | null;
notes?: string | null;
status: BloodRequestStatus;
createdAt: string;
updatedAt: string; }
/** Public donor fields; phone/WhatsApp are returned only after explicit contact-sharing consent. */ export type PublicDonor = Pick<
BloodDonor,
| "id"
| "bloodGroup"
| "availability"
| "divisionId"
| "districtId"
| "upazilaId"
| "donationCount"
| "preferredContact"
| "consentListed"
| "phone"
| "whatsapp"
| "updatedAt" > & { fullName: string };
export interface ReleasedBloodContact {
phone: string | null;
whatsapp: string | null; }
