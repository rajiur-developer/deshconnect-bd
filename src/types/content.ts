import type { LocationRef } from "./location";
export type PublishStatus =
| "draft"
| "pending_review"
| "published"
| "rejected"
| "archived";
export type VerificationStatus = "unverified" | "verified" | "disputed";
export interface Place extends LocationRef {
id: string;
slug: string;
name: string;
category: string;
categoryName?: string;
summary: string;
description: string;
address: string;
latitude?: number | null;
longitude?: number | null;
image: string;
gallery?: string[];
rating: number;
reviewCount: number;
openingHours?: string;
entryFee?: string;
bestTime?: string;
status: PublishStatus;
verification: VerificationStatus;
source?: string;
lastCheckedAt?: string;
createdAt: string;
updatedAt: string; }
export type InstitutionCategory = string;
export type HospitalCategory = string;
export type Hospital = Institution;
export interface Institution extends LocationRef {
id: string;
slug: string;
name: string;
category: InstitutionCategory;
categoryName?: string;
description: string;
address: string;
phone?: string | null;
email?: string | null;
website?: string | null;
emergencyPhone?: string | null;
latitude?: number | null;
longitude?: number | null;
image: string;
status: PublishStatus;
verification: VerificationStatus;
source?: string;
lastCheckedAt?: string;
createdAt: string;
updatedAt: string; }
export type BusinessCategory =
| "hotel"
| "restaurant"
| "transport"
| "shop"
| "service"
| "other";
export interface Business extends LocationRef {
id: string;
slug: string;
name: string;
category: BusinessCategory;
description: string;
address: string;
phone?: string | null;
website?: string | null;
image: string;
status: PublishStatus;
verification: VerificationStatus;
createdAt: string;
updatedAt: string; }
export type GovernmentServiceCategory =
| "identity"
| "land"
| "health"
| "education"
| "transport"
| "tax"
| "other";
export interface GovernmentService extends LocationRef {
id: string;
slug: string;
name: string;
category: GovernmentServiceCategory;
description: string;
officeAddress: string;
phone?: string | null;
emergencyPhone?: string | null;
website?: string | null;
hours?: string;
requiredDocuments?: string[];
status: PublishStatus;
createdAt: string;
updatedAt: string; }
export interface News extends LocationRef {
id: string;
slug: string;
title: string;
excerpt: string;
body: string;
image: string;
category: string;
categoryName?: string;
authorId: string;
source?: string;
status: PublishStatus;
publishedAt?: string | null;
createdAt: string;
updatedAt: string; }
export interface Review extends LocationRef {
id: string;
placeId: string;
authorId: string;
rating: number;
title: string;
body: string;
status: "visible" | "hidden" | "pending";
createdAt: string; }
