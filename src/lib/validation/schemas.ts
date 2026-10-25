// @ts-nocheck

import { z } from "zod";
import { getDonationEligibility, isValidBloodDonationDate } from "@/lib/blood-donation";

const BD_PHONE = /^(?:\+?880|0)1[3-9]\d{8}$/;
const BLOOD_GROUP_VALUES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const GENDER_VALUES = ["male", "female", "other", "prefer-not-to-say"] as const;

/** Human-readable length constraints, shown at the moment of posting. */
const max = (label: string, n: number) => `${label} must be at most ${n} characters`;
const min = (label: string, n: number) => `${label} must be at least ${n} characters`;

const bloodGroup = z.enum(BLOOD_GROUP_VALUES);
const gender = z.enum(GENDER_VALUES);

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  next: z.string().optional(),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, min("Full name", 2)).max(120, max("Full name", 120)),
  username: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]{3,24}$/, "Username must be 3–24 lowercase letters, numbers or underscores"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(BD_PHONE, "Enter a valid Bangladesh mobile number")
    .or(z.literal(""))
    .optional(),
  password: z.string().min(8, min("Password", 8)).max(128, max("Password", 128)),
  confirmPassword: z.string(),
  divisionId: z.string().optional(),
  districtId: z.string().optional(),
  upazilaId: z.string().optional(),
  bloodGroup: bloodGroup.optional(),
  gender: gender.optional(),
  dateOfBirth: z.string().optional(),
  termsAccepted: z.coerce.boolean(),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.termsAccepted === true, {
    message: "You must accept the terms",
    path: ["termsAccepted"],
  });

export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5, "Rating must be at most 5"),
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Review text is required"),
});

export const newsSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be at most 200 characters"),
  excerpt: z.string().min(1, "Excerpt is required").max(300, "Excerpt must be at most 300 characters"),
  body: z.string().min(1, "Body is required"),
  category: z.string().min(1, "Category is required"),
  source: z.string().optional(),
  image: z.string().optional(),
});

const phoneNumberSchema = z.string().trim().min(1, "Enter a valid phone number").max(30).refine((value) => {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}, "Enter a phone number with 8 to 15 digits");

export const bloodRequestSchema = z.object({
  bloodGroup: z.string().min(1, "Blood group is required"),
  units: z.coerce.number().min(1, "Units must be at least 1").max(20, "Units must be at most 20"),
  patient: z.string().trim().min(1, "Patient name is required"),
  hospital: z.string().min(1, "Hospital name is required"),
  neededBy: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date").refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date.getTime() >= new Date(new Date().toISOString().slice(0, 10)).getTime();
  }, "Needed by date cannot be in the past"),
  phone: phoneNumberSchema,
  whatsapp: phoneNumberSchema,
  notes: z.string().optional(),
  divisionId: z.string().min(1, "Division is required"),
  districtId: z.string().min(1, "District is required"),
  upazilaId: z.string().min(1, "Upazila is required"),
});

export const donorSchema = z.object({
  bloodGroup: z.string().min(1, "Blood group is required"),
  availability: z.enum(["available", "busy", "unavailable"], "Choose a valid availability"),
  preferredContact: z.enum(["phone", "sms", "email", "in-app"], "Choose a preferred contact method"),
  contactValue: z.string().trim().min(1, "Other contact information is required").max(200),
  phone: phoneNumberSchema,
  whatsapp: phoneNumberSchema,
  lastDonationAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Last donation date is required").refine(isValidBloodDonationDate, "Enter a valid last donation date that is not in the future"),
  notes: z.string().optional(),
  divisionId: z.string().min(1, "Division is required"),
  districtId: z.string().min(1, "District is required"),
  upazilaId: z.string().min(1, "Upazila is required"),
  consentListed: z.coerce.boolean(),
  consentContact: z.coerce.boolean(),
}).superRefine((data, ctx) => {
  const eligibility = getDonationEligibility(data.lastDonationAt);
  if (data.availability === "available" && !eligibility?.eligible) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["availability"],
      message: "You can mark yourself Ready only 75 days after your last donation.",
    });
  }
});

export const postSchema = z.object({
  body: z.string().trim().min(1, "Write something before posting").max(5000),
  image: z.string().optional(),
  divisionId: z.string().optional().transform(v => v === "" ? undefined : v),
  districtId: z.string().optional().transform(v => v === "" ? undefined : v),
  upazilaId: z.string().optional().transform(v => v === "" ? undefined : v),
});
export const commentSchema = z.object({ body: z.string().trim().min(1).max(2000) });
export const messageSchema = z.object({ body: z.string().trim().min(1).max(2000) });
export const reportSchema = z.object({
  reason: z.string().trim().min(3).max(120),
  details: z.string().trim().max(2000).optional(),
});
export const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(500).optional(),
  phone: z.string().trim().regex(BD_PHONE).or(z.literal("")).optional(),
  avatar: z.string().optional(),
  divisionId: z.string().optional().transform(v => v === "" ? undefined : v),
  districtId: z.string().optional().transform(v => v === "" ? undefined : v),
  upazilaId: z.string().optional().transform(v => v === "" ? undefined : v),
});
export const placeSchema = z.object({
  name: z.string().trim().min(2).max(200),
  category: z.string().trim().min(1),
  summary: z.string().trim().min(1).refine(
    (value) => value.split(/\s+/).filter(Boolean).length <= 200,
    "Summary must be 200 words or fewer.",
  ),
  description: z.string().trim().min(1).max(10000),
  address: z.string().trim().min(1).max(300),
  entryFee: z.string().optional(),
  openingHours: z.string().optional(),
  bestTime: z.string().optional(),
  image: z.string().optional(),
  divisionId: z.string().optional().transform(v => v === "" ? undefined : v),
  districtId: z.string().optional().transform(v => v === "" ? undefined : v),
  upazilaId: z.string().optional().transform(v => v === "" ? undefined : v),
});
export const institutionSchema = z.object({
  name: z.string().trim().min(2).max(200),
  category: z.enum([
    "school",
    "college",
    "madrasah",
    "university",
    "kindergarten",
    "education-centre",
    "hospital",
    "health-centre",
  ]),
  description: z.string().trim().min(1).max(10000),
  address: z.string().trim().min(1).max(300),
  phone: z.string().trim().max(50).optional(),
  email: z.string().trim().max(200).optional(),
  website: z.string().trim().max(200).optional(),
  emergencyPhone: z.string().trim().max(50).optional(),
  image: z.string().optional(),
  divisionId: z.string().optional().transform(v => v === "" ? undefined : v),
  districtId: z.string().optional().transform(v => v === "" ? undefined : v),
  upazilaId: z.string().optional().transform(v => v === "" ? undefined : v),
});
export const staffNewsSchema = newsSchema;
export const emergencyAlertSchema = z.object({
  bloodGroup: bloodGroup,
  units: z.coerce.number().int().min(1).max(20),
  hospital: z.string().trim().min(2).max(200),
  neededBy: z.string().min(1),
  notes: z.string().trim().max(1000).optional(),
});
export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(200),
  category: z.string().trim().min(1),
  description: z.string().trim().min(1).max(10000),
  officeAddress: z.string().trim().min(1).max(300),
  phone: z.string().optional(),
  emergencyPhone: z.string().optional(),
  website: z.string().optional(),
  hours: z.string().optional(),
  requiredDocuments: z.string().optional(),
  divisionId: z.string().optional().transform(v => v === "" ? undefined : v),
  districtId: z.string().optional().transform(v => v === "" ? undefined : v),
  upazilaId: z.string().optional().transform(v => v === "" ? undefined : v),
});
export const businessSchema = z.object({
  name: z.string().trim().min(2).max(200),
  category: z.string().trim().min(1),
  description: z.string().trim().min(1).max(10000),
  address: z.string().trim().min(1).max(300),
  phone: z.string().optional(),
  website: z.string().optional(),
  image: z.string().optional(),
  divisionId: z.string().optional().transform(v => v === "" ? undefined : v),
  districtId: z.string().optional().transform(v => v === "" ? undefined : v),
  upazilaId: z.string().optional().transform(v => v === "" ? undefined : v),
});
export const locationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  title: z.string().trim().max(300).optional(),
  category: z.enum(["division", "district", "upazila"]),
  image: z.string().optional(),
  parentId: z.string().optional(),
});

export const formatZodError = (result: {
  issues?: Array<{ message: string }>;
  errors?: Array<{ message: string }>;
}): string => {
  return (result.issues ?? result.errors ?? []).map((issue) => issue.message).join(". ");
};
