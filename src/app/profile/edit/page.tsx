import { requireUser } from "@/lib/auth/current-user"; import { getUserById } from "@/services/users"; import { getDirectoryLocationOptions } from "@/services/locations"; import { AccountShell } from "@/components/layout/account-shell"; import { ProfileEditForm } from "@/components/account/account-forms"; import { cookies } from "next/headers"; import { createServerClient } from "@insforge/sdk/ssr"; import { PROFILE_IMAGE_BUCKET } from "@/features/account/constants";
export const metadata = { title: "Edit profile", robots: { index: false, follow: false } };
export default async function ProfileEditPage() {
const user = await requireUser("/profile/edit");
const [full, options] = await Promise.all([getUserById(user.id), getDirectoryLocationOptions()]);
let avatar = full?.avatar;
if (full?.avatarKey) {
const client = createServerClient({ cookies: await cookies() });
const { data } = await client.storage.from(PROFILE_IMAGE_BUCKET).createSignedUrl(full.avatarKey, 3600);
avatar = data?.signedUrl ?? "";
}
return (
<AccountShell user={user} title="Edit profile" description="Update your name, bio, photo and location.">
<ProfileEditForm
userId={user.id}
divisions={options.divisions}
districts={options.districts}
upazilas={options.upazilas}
initial={{
fullName: full?.fullName ?? user.fullName,
bio: full?.bio,
phone: full?.phone,
avatar,
divisionId: full?.divisionId ?? undefined,
districtId: full?.districtId ?? undefined,
upazilaId: full?.upazilaId ?? undefined,
}}
/>
</AccountShell>
); }
