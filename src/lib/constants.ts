// @ts-nocheck
import type { BloodGroup, Gender } from "@/types/auth"; import type { InstitutionCategory } from "@/types/content";
export const BLOOD_GROUPS: BloodGroup[] = [
"A+",
"A-",
"B+",
"B-",
"AB+",
"AB-",
"O+",
"O-", ];
export const GENDERS: { value: Gender; label: string }[] = [
{ value: "female", label: "Female" },
{ value: "male", label: "Male" },
{ value: "other", label: "Other" },
{ value: "prefer-not-to-say", label: "Prefer not to say" }, ];
export const INSTITUTION_CATEGORIES: {
value: InstitutionCategory;
label: string; }[] = [
{ value: "school", label: "School" },
{ value: "college", label: "College" },
{ value: "madrasah", label: "Madrasah" },
{ value: "university", label: "University" },
{ value: "kindergarten", label: "Kindergarten" },
{ value: "education-centre", label: "Other education centre" },
{ value: "hospital", label: "Hospital" },
{ value: "health-centre", label: "Health centre" }, ];
export const PLACE_CATEGORIES = [
{ value: "heritage", label: "Heritage" },
{ value: "beach", label: "Beach & Sea" },
{ value: "hill", label: "Hills & Trekking" },
{ value: "forest", label: "Forest & Wildlife" },
{ value: "river", label: "Rivers & Wetlands" },
{ value: "park", label: "Parks & Nature" },
{ value: "city", label: "City Highlights" }, ] as const;
export const PAGE_SIZE = 12; export const NEWS_PAGE_SIZE = 9;
/** Pre-built news artwork staff and members can attach to an article. */ export const NEWS_IMAGES = [
"/images/news/n1.svg",
"/images/news/n2.svg",
"/images/news/n3.svg",
"/images/news/n4.svg",
"/images/news/n5.svg",
"/images/news/n6.svg",
"/images/news/n7.svg",
"/images/news/n8.svg",
"/images/news/n9.svg",
"/images/news/n10.svg",
"/images/news/n11.svg",
"/images/news/n12.svg",
"/images/news/user.svg", ];
/** Placeholder artwork available when creating directory records. */ export const PLACE_IMAGES = [
"/images/places/p1.svg",
"/images/places/p2.svg",
"/images/places/p3.svg",
"/images/places/p4.svg",
"/images/places/p5.svg",
"/images/places/p6.svg", ];
export const LOCATION_IMAGES = [
"/images/divisions/division.svg",
"/images/districts/district.svg",
"/images/places/p1.svg",
"/images/places/p2.svg",
"/images/places/p3.svg", ];
export const SESSION_COOKIE = "deshconnect_session"; export const SESSION_TTL_DAYS = 14;
export const RATES = {
loginPerMinute: 10,
registerPerHour: 5,
resetPerHour: 5,
postPerMinute: 5,
reportPerMinute: 5,
bloodChatPerMinute: 30,
bloodRequestPerHour: 5, } as const;
/** In-memory rate limiting — swap for a shared store when scaling out. */ export const DEFAULT_MAPS_LINK = "https://www.google.com/maps";
