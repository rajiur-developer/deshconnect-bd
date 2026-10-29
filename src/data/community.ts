/**
* Static seed data for accounts, blood donation, community, and platform state.
* Passwords are plain here only for seeding; the seeder hashes them before the
* data reaches the file-backed store.
*/
import type { BloodGroup, Gender, Role } from "@/types/auth"; import type { SeedLocation } from "./content";
export type SeedUser = {
username: string;
fullName: string;
email: string;
password: string;
phone?: string;
avatar?: string;
bio?: string;
location?: SeedLocation;
bloodGroup?: BloodGroup;
gender?: Gender;
dateOfBirth?: string;
role?: Role;
status?: "active" | "suspended" | "pending"; };
export type SeedDonor = {
location?: SeedLocation;
userId: string;
bloodGroup: BloodGroup;
availability: "available" | "busy" | "unavailable";
preferredContact: "phone" | "sms" | "email" | "in-app";
contactValue: string;
lastDonationAt?: string;
donationCount: number;
notes?: string;
consentListed: boolean;
consentContact: boolean;
consentExpiry: string; };
export type SeedBloodRequest = {
location?: SeedLocation;
requesterId: string;
bloodGroup: BloodGroup;
units: number;
patient?: string;
hospital: string;
neededBy: string;
notes?: string;
status: "active" | "fulfilled" | "cancelled" | "expired" | "under_review"; };
export type SeedPost = {
location?: SeedLocation;
authorId: string;
body: string;
image?: string;
reactions: number;
status: "visible" | "hidden" | "pending" | "deleted"; };
export type SeedComment = {
postId: string;
authorId: string;
body: string;
status: "visible" | "hidden" | "deleted"; };
export type SeedNotification = {
userId: string;
title: string;
body: string;
href?: string;
read: boolean; };
export const USER_SEED: SeedUser[] = [
{ username: "admin", fullName: "Platform Administrator", email: "admin@deshconnect.test", password: "password123", phone: "01700000001", avatar: "/images/avatars/avatar-1.svg", bio: "Administrator account for DeshConnect.", role: "admin" },
{ username: "moderator", fullName: "Content Moderator", email: "moderator@deshconnect.test", password: "password123", phone: "01700000002", avatar: "/images/avatars/avatar-2.svg", bio: "Reviews community and news submissions.", role: "moderator" },
{ username: "rahman", fullName: "Rahman Hossain", email: "rahman@example.com", password: "password123", phone: "01712345678", avatar: "/images/avatars/avatar-3.svg", bio: "Travel lover and amateur photographer.", location: { division: "chattogram", district: "rangamati", upazila: "Rangamati Sadar" }, bloodGroup: "O+", gender: "male", dateOfBirth: "1994-03-12" },
{ username: "nusrat", fullName: "Nusrat Jahan", email: "nusrat@example.com", password: "password123", phone: "01812345678", avatar: "/images/avatars/avatar-4.svg", bio: "Hill trekker. Ask me about Sajek.", location: { division: "dhaka", district: "dhaka", upazila: "Mirpur" }, bloodGroup: "A+", gender: "female", dateOfBirth: "1996-07-01" },
{ username: "tanvir", fullName: "Tanvir Ahmed", email: "tanvir@example.com", password: "password123", phone: "01912345678", avatar: "/images/avatars/avatar-5.svg", bio: "Beach person. Cox's Bazar regular.", location: { division: "chattogram", district: "coxs-bazar", upazila: "Cox's Bazar Sadar" }, bloodGroup: "B+", gender: "male", dateOfBirth: "1991-11-23" },
{ username: "maria", fullName: "Maria Sultana", email: "maria@example.com", password: "password123", phone: "01612345678", avatar: "/images/avatars/avatar-6.svg", bio: "History and heritage enthusiast.", location: { division: "khulna", district: "bagerhat", upazila: "Bagerhat Sadar" }, bloodGroup: "AB+", gender: "female", dateOfBirth: "1998-01-15" },
{ username: "rakib", fullName: "Rakib Hasan", email: "rakib@example.com", password: "password123", phone: "01512345678", avatar: "/images/avatars/avatar-1.svg", bio: "Forest and wildlife watcher.", location: { division: "khulna", district: "satkhira", upazila: "Satkhira Sadar" }, bloodGroup: "O-", gender: "male", dateOfBirth: "1993-05-30" },
{ username: "farhana", fullName: "Farhana Akter", email: "farhana@example.com", password: "password123", phone: "01712345679", avatar: "/images/avatars/avatar-2.svg", bio: "Archaeology student.", location: { division: "rajshahi", district: "naogaon", upazila: "Badalgachhi" }, bloodGroup: "A-", gender: "female", dateOfBirth: "2000-02-14" },
{ username: "shanto", fullName: "Shanto Roy", email: "shanto@example.com", password: "password123", phone: "01812345679", avatar: "/images/avatars/avatar-3.svg", bio: "Weekend traveller from Dhaka.", location: { division: "dhaka", district: "dhaka", upazila: "Dhanmondi" }, bloodGroup: "B-", gender: "male", dateOfBirth: "1997-09-09" },
{ username: "mim", fullName: "Mim Chowdhury", email: "mim@example.com", password: "password123", phone: "01912345679", avatar: "/images/avatars/avatar-4.svg", bio: "Love the Sylhet tea gardens.", location: { division: "sylhet", district: "sylhet", upazila: "Sylhet Sadar" }, bloodGroup: "AB-", gender: "female", dateOfBirth: "1999-12-03" },
{ username: "arif", fullName: "Arif Chowdhury", email: "arif@example.com", password: "password123", phone: "01612345679", avatar: "/images/avatars/avatar-5.svg", bio: "Photographer and traveller.", location: { division: "barishal", district: "patuakhali", upazila: "Kalapara" }, bloodGroup: "O+", gender: "male", dateOfBirth: "1995-04-18" },
{ username: "tania", fullName: "Tania Sultana", email: "tania@example.com", password: "password123", phone: "01512345679", avatar: "/images/avatars/avatar-6.svg", bio: "Nature and waterfall chaser.", location: { division: "sylhet", district: "moulvibazar", upazila: "Barlekha" }, bloodGroup: "B+", gender: "female", dateOfBirth: "1997-06-25" },
{ username: "mehedi", fullName: "Mehedi Hasan", email: "mehedi@example.com", password: "password123", phone: "01712345680", avatar: "/images/avatars/avatar-1.svg", bio: "Tea, travel and trips.", location: { division: "sylhet", district: "sylhet", upazila: "Jaintiapur" }, bloodGroup: "A+", gender: "male", dateOfBirth: "1994-10-08" },
{ username: "sadia", fullName: "Sadia Islam", email: "sadia@example.com", password: "password123", phone: "01812345680", avatar: "/images/avatars/avatar-2.svg", bio: "Architecture and heritage.", location: { division: "khulna", district: "bagerhat", upazila: "Bagerhat Sadar" }, bloodGroup: "AB+", gender: "female", dateOfBirth: "1996-03-22" }, ];
export const DONOR_SEED: SeedDonor[] = [
{ userId: "rahman", bloodGroup: "O+", availability: "available", preferredContact: "phone", contactValue: "01712345678", lastDonationAt: "2025-12-01", donationCount: 6, consentListed: true, consentContact: true, consentExpiry: "2027-01-01", location: { division: "chattogram", district: "rangamati" } },
{ userId: "nusrat", bloodGroup: "A+", availability: "available", preferredContact: "sms", contactValue: "01812345678", donationCount: 3, consentListed: true, consentContact: false, consentExpiry: "2026-12-31", location: { division: "dhaka", district: "dhaka", upazila: "Mirpur" } },
{ userId: "tanvir", bloodGroup: "B+", availability: "busy", preferredContact: "phone", contactValue: "01912345678", donationCount: 4, consentListed: true, consentContact: true, consentExpiry: "2026-06-30", location: { division: "chattogram", district: "coxs-bazar" } },
{ userId: "rakib", bloodGroup: "O-", availability: "available", preferredContact: "email", contactValue: "rakib@example.com", lastDonationAt: "2025-10-12", donationCount: 9, consentListed: true, consentContact: true, consentExpiry: "2027-06-30", location: { division: "khulna", district: "satkhira" } },
{ userId: "farhana", bloodGroup: "A-", availability: "unavailable", preferredContact: "in-app", contactValue: "farhana@example.com", donationCount: 1, consentListed: true, consentContact: false, consentExpiry: "2026-03-31", location: { division: "rajshahi", district: "naogaon" } },
{ userId: "shanto", bloodGroup: "B-", availability: "available", preferredContact: "phone", contactValue: "01812345679", donationCount: 2, consentListed: true, consentContact: true, consentExpiry: "2026-09-30", location: { division: "dhaka", district: "dhaka" } },
{ userId: "mim", bloodGroup: "AB-", availability: "available", preferredContact: "sms", contactValue: "01912345679", donationCount: 1, consentListed: true, consentContact: false, consentExpiry: "2026-05-31", location: { division: "sylhet", district: "sylhet" } },
{ userId: "arif", bloodGroup: "O+", availability: "busy", preferredContact: "phone", contactValue: "01612345679", donationCount: 5, consentListed: true, consentContact: true, consentExpiry: "2026-08-31", location: { division: "barishal", district: "patuakhali" } },
{ userId: "tania", bloodGroup: "B+", availability: "available", preferredContact: "email", contactValue: "tania@example.com", donationCount: 2, consentListed: true, consentContact: true, consentExpiry: "2026-11-30", location: { division: "sylhet", district: "moulvibazar" } },
{ userId: "mehedi", bloodGroup: "A+", availability: "available", preferredContact: "phone", contactValue: "01712345680", lastDonationAt: "2025-11-20", donationCount: 7, consentListed: true, consentContact: true, consentExpiry: "2027-01-31", location: { division: "sylhet", district: "sylhet" } },
{ userId: "sadia", bloodGroup: "AB+", availability: "available", preferredContact: "in-app", contactValue: "sadia@example.com", donationCount: 3, consentListed: true, consentContact: false, consentExpiry: "2026-07-31", location: { division: "khulna", district: "bagerhat" } },
{ userId: "maria", bloodGroup: "AB+", availability: "available", preferredContact: "email", contactValue: "maria@example.com", donationCount: 0, consentListed: false, consentContact: false, consentExpiry: "2026-12-31", location: { division: "khulna", district: "bagerhat" } }, ];
export const BLOOD_REQUEST_SEED: SeedBloodRequest[] = [
{ requesterId: "rahman", bloodGroup: "O+", units: 2, patient: "Mr. Karim", hospital: "Dhaka Medical College Hospital", neededBy: "2026-11-02", notes: "Post-operative support. Please call the hospital desk.", status: "active", location: { division: "dhaka", district: "dhaka" } },
{ requesterId: "tanvir", bloodGroup: "A+", units: 1, patient: "Ms. Akter", hospital: "Chittagong Medical College Hospital", neededBy: "2026-10-30", status: "active", location: { division: "chattogram", district: "chattogram" } },
{ requesterId: "nusrat", bloodGroup: "B+", units: 3, patient: "Child patient", hospital: "BSMMU", neededBy: "2026-10-28", notes: "Urgent. Thalassemia patient.", status: "under_review", location: { division: "dhaka", district: "dhaka" } },
{ requesterId: "maria", bloodGroup: "O-", units: 1, patient: "Road accident victim", hospital: "Cox's Bazar Upazila Health Complex", neededBy: "2026-10-25", status: "fulfilled", location: { division: "chattogram", district: "coxs-bazar" } },
{ requesterId: "rakib", bloodGroup: "AB-", units: 2, patient: "Ms. Begum", hospital: "Rangpur Medical College Hospital", neededBy: "2026-11-05", status: "active", location: { division: "rangpur", district: "rangpur" } }, ];
export const POST_SEED: SeedPost[] = [
{ authorId: "rahman", body: "Planning a Sajek trip in December. Anyone have homestay recommendations near Ruilui village?", reactions: 12, status: "visible", location: { division: "chattogram", district: "rangamati" } },
{ authorId: "tanvir", body: "Cox's Bazar was beautiful this weekend. Inani is much quieter than Laboni — worth the extra drive.", image: "/images/posts/post-1.svg", reactions: 24, status: "visible", location: { division: "chattogram", district: "coxs-bazar" } },
{ authorId: "farhana", body: "Visited Paharpur today. The scale of Somapura Mahavihara is hard to capture in photos.", reactions: 18, status: "visible", location: { division: "rajshahi", district: "naogaon" } },
{ authorId: "mim", body: "The tea gardens in Sreemangal look unreal after the rain. Highly recommend a November visit.", reactions: 9, status: "visible", location: { division: "sylhet", district: "moulvibazar" } },
{ authorId: "rakib", body: "Reminder for Sundarbans visitors: you need a permit and a licensed guide. Please don't try to go alone.", reactions: 31, status: "visible", location: { division: "khulna", district: "satkhira" } },
{ authorId: "sadia", body: "Heritage conservation needs more attention in Old Dhaka. We should document these buildings before they are lost.", reactions: 15, status: "visible", location: { division: "dhaka", district: "dhaka" } },
{ authorId: "nusrat", body: "Share your favourite budget eats in Sylhet city — building a small guide.", reactions: 7, status: "pending", location: { division: "sylhet", district: "sylhet" } }, ];
export const COMMENT_SEED: SeedComment[] = [
{ postId: "p1", authorId: "tanvir", body: "Try the homestays near Sajek resort gate — basic but friendly.", status: "visible" },
{ postId: "p1", authorId: "nusrat", body: "Book early for December, rooms fill up fast.", status: "visible" },
{ postId: "p2", authorId: "arif", body: "Inani is the best part of Cox's Bazar.", status: "visible" },
{ postId: "p2", authorId: "maria", body: "Did you try the seafood at Inani?", status: "visible" },
{ postId: "p3", authorId: "sadia", body: "The site museum is excellent too.", status: "visible" },
{ postId: "p4", authorId: "mehedi", body: "Kulaura tea garden is a hidden gem.", status: "visible" },
{ postId: "p5", authorId: "rakib", body: "Permits can be arranged through the forest office in Mongla.", status: "visible" },
{ postId: "p6", authorId: "farhana", body: "Yes — documentation matters so much.", status: "visible" }, ];
export const NOTIFICATION_SEED: SeedNotification[] = [
{ userId: "admin", title: "New user registrations", body: "14 users joined DeshConnect this week.", href: "/admin/users", read: false },
{ userId: "admin", title: "News awaiting review", body: "1 news submission is in pending_review.", href: "/admin/news", read: false },
{ userId: "moderator", title: "New report submitted", body: "A community post has been reported.", href: "/admin/reports", read: false },
{ userId: "rahman", title: "Your blood request is active", body: "Your O+ request is now visible to donors.", href: "/my-blood-requests", read: false },
{ userId: "rahman", title: "New comment on your post", body: "Tanvir commented on your Sajek post.", href: "/community", read: true },
{ userId: "nusrat", title: "Your post is pending review", body: "We'll notify you once it's approved.", href: "/my-posts", read: false }, ];
export const CONNECTION_SEED = [
{ requesterId: "rahman", addresseeId: "tanvir", status: "accepted" },
{ requesterId: "nusrat", addresseeId: "mim", status: "accepted" },
{ requesterId: "farhana", addresseeId: "sadia", status: "accepted" },
{ requesterId: "arif", addresseeId: "shanto", status: "pending" }, ];
export const CONVERSATION_SEED = [
{ id: "c1", participantIds: ["rahman", "tanvir"] },
{ id: "c2", participantIds: ["nusrat", "mim"] }, ];
export const MESSAGE_SEED = [
{ conversationId: "c1", senderId: "rahman", body: "Hi! Are you free to chat about the Sajek route?" },
{ conversationId: "c1", senderId: "tanvir", body: "Sure, happy to help. Which month?" },
{ conversationId: "c2", senderId: "mim", body: "The Sreemangal guide is ready!" }, ];
export const SAVED_SEED = [
{ userId: "rahman", placeSlug: "sajek-valley" },
{ userId: "rahman", placeSlug: "kaptai-lake" },
{ userId: "tanvir", placeSlug: "coxs-bazar-beach" },
{ userId: "mim", placeSlug: "madhabkunda-waterfall" }, ];
export const REPORT_SEED = [
{ targetType: "post" as const, targetId: "p7", reporterId: "shanto", reason: "Spam", details: "Looks like promotional spam.", status: "open" as const }, ];
export const CORRECTION_SEED = [
{ targetType: "place" as const, targetSlug: "jaflong", targetName: "Jaflong", submittedBy: "mehedi", message: "The best-time note should mention that the river level rises sharply after rain.", status: "open" as const }, ];
