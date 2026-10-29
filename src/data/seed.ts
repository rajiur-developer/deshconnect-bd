// @ts-nocheck
// Dev-only fixture: this module emits raw Postgres-shaped rows (snake_case
// columns, plural table names) for the local file-backed store in
// src/lib/db/store.ts. That deliberately differs from the camelCase `Database`
// domain model, so it is excluded from strict type checking. It is never
// executed in production (see the NODE_ENV guards in src/lib/insforge.ts).
import "server-only";
import { hashPassword } from "@/lib/auth/password"; import { slugify } from "@/lib/utils"; import type { BloodRequest, BloodDonor } from "@/types/blood"; import type { Post, Comment, Connection, Conversation, Message, Notification, Report } from "@/types/community"; import type { Database } from "@/types/admin"; import type { LocationRef } from "@/types/location"; import type { District, Division, Upazila } from "@/types/location";
import { LOCATION_SEED } from "./locations"; import {
BUSINESS_LOCATIONS,
INSTITUTION_LOCATIONS,
PLACE_LOCATIONS,
SERVICE_LOCATIONS,
PLACE_SEED,
INSTITUTION_SEED,
BUSINESS_SEED,
SERVICE_SEED,
NEWS_SEED,
REVIEW_SEED,
type SeedLocation, } from "./content"; import {
USER_SEED,
DONOR_SEED,
BLOOD_REQUEST_SEED,
POST_SEED,
COMMENT_SEED,
NOTIFICATION_SEED,
CONNECTION_SEED,
CONVERSATION_SEED,
MESSAGE_SEED,
SAVED_SEED,
REPORT_SEED,
CORRECTION_SEED, } from "./community";
const NOW = Date.UTC(2026, 9, 19, 9, 0, 0);
function daysAgo(n: number): string {
return new Date(NOW - n * 86_400_000).toISOString(); }
function daysFromNow(n: number): string {
return new Date(NOW + n * 86_400_000).toISOString(); }
export function seedDatabase(): Database {
const divisions: Division[] = LOCATION_SEED.map((d) => ({
id: `div-${d.slug}`,
slug: d.slug,
name: d.name,
bnName: d.name,
capital: d.capital,
districtsCount: d.districts.length,
summary: `${d.name} is one of the eight divisions of Bangladesh, with its divisional headquarters in ${d.capital}.`,
image: "/images/divisions/division.svg",
}));
const districts: District[] = [];
const upazilas: Upazila[] = [];
for (const division of LOCATION_SEED) {
for (const district of division.districts) {
districts.push({
id: `dis-${district.slug}`,
slug: district.slug,
name: district.name,
division_id: `div-${division.slug}`,
summary: `${district.name} district is part of ${division.name} division.`,
image: "/images/districts/district.svg",
});
for (const name of district.upazilas) {
upazilas.push({
id: `upa-${district.slug}-${slugify(name)}`,
slug: slugify(name),
name: name,
district_id: `dis-${district.slug}`,
});
}
}
}
const divisionBySlug = new Map(divisions.map((d) => [d.slug, d]));
const districtBySlug = new Map(districts.map((d) => [d.slug, d]));
const upazilaByKey = new Map(upazilas.map((u) => [`${u.district_id}|${u.name.toLowerCase()}`, u]));
function resolveLocation(loc?: SeedLocation) {
if (!loc) return {};
const out: LocationRef = {};
if (loc.division && divisionBySlug.has(loc.division)) out.division_id = divisionBySlug.get(loc.division)!.id;
if (loc.district && districtBySlug.has(loc.district)) out.district_id = districtBySlug.get(loc.district)!.id;
if (loc.upazila && out.district_id) {
const upazila = upazilaByKey.get(`${out.district_id}|${loc.upazila.toLowerCase()}`);
if (upazila) out.upazila_id = upazila.id;
}
return out;
}
const userIds = new Map<string, string>();
const users = USER_SEED.map((seed, index) => {
const id = slugify(seed.username);
userIds.set(seed.username, id);
const { password, location, ...rest } = seed;
return {
id,
...rest,
...resolveLocation(location),
role: seed.role ?? ("user" as const),
password_hash: hashPassword(password),
avatar: seed.avatar ?? `/images/avatars/avatar-${(index % 6) + 1}.svg`,
blood_group: seed.blood_group,
gender: seed.gender,
date_of_birth: seed.date_of_birth,
status: seed.status ?? ("active" as const),
};
});
const userId = (username: string) => userIds.get(username) ?? username;
const places = PLACE_SEED.map((seed) => ({
id: `place_${slugify(seed.slug)}`,
...seed,
...resolveLocation(PLACE_LOCATIONS[seed.slug]),
status: "published",
last_checked_at: daysAgo(12),
created_at: daysAgo(260),
updated_at: daysAgo(12),
}));
const institutions = INSTITUTION_SEED.map((seed) => ({
id: `inst_${slugify(seed.slug)}`,
...seed,
...resolveLocation(INSTITUTION_LOCATIONS[seed.slug]),
status: "published",
last_checked_at: daysAgo(18),
created_at: daysAgo(240),
updated_at: daysAgo(18),
}));
const businesses = BUSINESS_SEED.map((seed) => ({
id: `biz_${slugify(seed.slug)}`,
...seed,
...resolveLocation(BUSINESS_LOCATIONS[seed.slug]),
status: "published",
created_at: daysAgo(220),
updated_at: daysAgo(20),
}));
const government_services = SERVICE_SEED.map((seed) => ({
id: `svc_${slugify(seed.slug)}`,
...seed,
...resolveLocation(SERVICE_LOCATIONS[seed.slug]),
status: "published",
created_at: daysAgo(200),
updated_at: daysAgo(25),
}));
const news = NEWS_SEED.map((seed) => ({
id: `news_${slugify(seed.slug)}`,
slug: seed.slug,
title: seed.title,
excerpt: seed.excerpt,
body: seed.body,
image: seed.image,
category: seed.category,
author_id: userId(seed.authorUsername),
source: seed.source,
status: "published",
published_at: daysAgo(14),
created_at: daysAgo(20),
updated_at: daysAgo(14),
}));
const placeBySlug = new Map(places.map((p) => [p.slug, p]));
const reviews = REVIEW_SEED.map((seed, index) => ({
id: `rev_${index + 1}`,
place_id: placeBySlug.get(seed.placeSlug)?.id ?? "",
author_id: userId(seed.authorUsername),
rating: seed.rating,
title: seed.title,
body: seed.body,
status: "visible",
created_at: daysAgo(60 - index),
...resolveLocation(PLACE_LOCATIONS[seed.placeSlug]),
})).filter((r) => r.place_id !== "");
const donors: BloodDonor[] = DONOR_SEED.map((seed) => {
const { location, ...rest } = seed;
return {
...rest,
...resolveLocation(location),
id: `don_${userId(seed.userId)}`,
user_id: userId(seed.userId),
created_at: daysAgo(150),
updated_at: daysAgo(7),
};
});
const blood_requests: BloodRequest[] = BLOOD_REQUEST_SEED.map((seed, index) => {
const { location, ...rest } = seed;
return {
...rest,
...resolveLocation(location),
id: `req_${index + 1}`,
requester_id: userId(seed.requesterId),
created_at: daysFromNow(-3 - index),
updated_at: daysFromNow(-3 - index),
};
});
const posts: Post[] = POST_SEED.map((seed, index) => ({
id: `p${index + 1}`,
author_id: userId(seed.authorId),
body: seed.body,
image: seed.image ?? null,
reactions: seed.reactions,
status: seed.status,
...resolveLocation(seed.location),
created_at: daysAgo(10 - index),
updated_at: daysAgo(10 - index),
}));
const comments: Comment[] = COMMENT_SEED.map((seed, index) => ({
id: `cm_${index + 1}`,
post_id: seed.postId,
author_id: seed.authorId,
body: seed.body,
status: seed.status,
created_at: daysAgo(8 - index),
}));
const notifications: Notification[] = NOTIFICATION_SEED.map((seed, index) => ({
id: `ntf_${index + 1}`,
user_id: userId(seed.authorUsername),
title: seed.title,
body: seed.body,
href: seed.href ?? null,
read: seed.read,
created_at: daysAgo(2 + index),
}));
const connections: Connection[] = CONNECTION_SEED.map((seed, index) => ({
id: `con_${index + 1}`,
requester_id: userId(seed.requesterId),
addressee_id: userId(seed.addresseeId),
status: seed.status as Connection["status"],
created_at: daysAgo(30 - index),
updated_at: daysAgo(20 - index),
}));
const conversations: Conversation[] = CONVERSATION_SEED.map((c) => ({
id: c.id,
participant_ids: c.participantIds.map(userId),
updated_at: daysAgo(1),
}));
const messages: Message[] = MESSAGE_SEED.map((seed, index) => ({
id: `msg_${index + 1}`,
conversation_id: seed.conversationId,
sender_id: userId(seed.senderId),
body: seed.body,
read_by: [userId(seed.senderId)],
created_at: daysAgo(1 - index * 0.2),
}));
const saved: SavedPlace[] = SAVED_SEED.map((seed) => ({
id: `save_${seed.userId}_${seed.placeSlug}`,
user_id: userId(seed.userId),
place_id: placeBySlug.get(seed.placeSlug)?.id ?? "",
created_at: daysAgo(15),
})).filter((s) => s.place_id !== "");
const reports: Report[] = REPORT_SEED.map((seed, index) => ({
id: `rep_${index + 1}`,
target_type: seed.targetType,
target_id: seed.targetId,
reporter_id: userId(seed.reporterId),
reason: seed.reason,
details: seed.details ?? null,
status: seed.status,
resolution: null,
created_at: daysAgo(2),
updated_at: daysAgo(2),
}));
const corrections: Correction[] = CORRECTION_SEED.map((seed, index) => ({
id: `cor_${index + 1}`,
target_type: seed.targetType,
target_id: placeBySlug.get(seed.targetSlug)?.id ?? "",
target_name: seed.targetName,
submitted_by: userId(seed.submittedBy),
message: seed.message,
status: seed.status,
created_at: daysAgo(4),
updated_at: daysAgo(4),
}));
return {
users,
password_resets: [],
divisions,
districts,
upazilas,
unions: [],
places,
institutions,
businesses,
government_services,
news,
reviews,
posts,
comments,
reports,
connections,
conversations,
messages,
notifications,
donors,
blood_requests,
saved,
 audit_logs: [{
  id: "00000000-0000-4000-8000-000000000002",
  actorId: "00000000-0000-4000-8000-000000000001",
  actorName: "Admin",
  action: "seed:initialized",
  entity: "system",
  entityId: "seed",
  outcome: "success",
  detail: "Development seed audit event.",
  createdAt: daysAgo(1),
 }],
settings: {
site_name: "DeshConnect",
allow_public_posts: true,
require_news_approval: true,
donor_directory_enabled: true,
role_permission_overrides: {},
},
}; }
