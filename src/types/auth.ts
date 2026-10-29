export type Role = "user" | "moderator" | "admin"; export type AccountStatus = "active" | "suspended" | "pending"; export type BloodGroup =
| "A+"
| "A-"
| "B+"
| "B-"
| "AB+"
| "AB-"
| "O+"
| "O-";
export type Gender = "male" | "female" | "other" | "prefer-not-to-say";
export interface User {
id: string;
username: string;
fullName: string;
email: string;
phone?: string;
/** scrypt hash — never returned to the client layer. */
passwordHash?: string;
avatar: string;
avatarKey?: string;
bio?: string;
divisionId?: string | null;
districtId?: string | null;
upazilaId?: string | null;
bloodGroup?: BloodGroup | null;
gender?: Gender | null;
dateOfBirth?: string | null;
role: Role;
status: AccountStatus;
emailVerified: boolean;
termsAcceptedAt?: string | null;
createdAt: string;
updatedAt: string; }
/** Safe projection of a user for public/exported contexts. */ export type PublicUser = Pick<
User,
| "id"
| "username"
| "fullName"
| "avatar"
| "avatarKey"
| "bio"
| "divisionId"
| "districtId"
| "upazilaId"
| "role"
| "createdAt" >;
export interface Session {
userId: string;
issuedAt: number; }
export interface PasswordReset {
token: string;
userId: string;
expiresAt: string;
used: boolean; }
