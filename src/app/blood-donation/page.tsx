import type { Metadata } from "next";
import { BLOOD_GROUPS } from "@/lib/constants"; import { firstParam } from "@/lib/query"; import { formatLocation, getDirectoryLocationOptions } from "@/services/locations"; import { getDonorForUser, listBloodRequests, listPublicDonors } from "@/services/blood"; import { getCurrentUser } from "@/lib/auth/current-user"; import { DirectoryFilters } from "@/components/search/directory-filters"; import { DonorCard } from "@/components/blood/donor-card"; import { BloodRequestCard } from "@/components/blood/blood-request-card"; import { BloodRequestForm, DonorForm } from "@/components/blood/blood-forms"; import { CancelRequestButton } from "@/components/blood/donor-actions"; import { DonorContactButtons, RequesterContactButtons } from "@/components/blood/contact-buttons"; import { EmptyState } from "@/components/ui/empty-state"; import { PageBanner } from "@/components/layout/page-banner"; import { Badge, Section } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons";
export const metadata: Metadata = {
title: "Blood donation",
description: "Find voluntary blood donors or post a request. Contact donors who opted in to public phone and WhatsApp sharing.", };
export default async function BloodDonationPage({
searchParams, }: {
searchParams: Promise<Record<string, string | string[] | undefined>>; }) {
const params = await searchParams;
const divisionId = firstParam(params.divisionId);
const districtId = firstParam(params.districtId);
const upazilaId = firstParam(params.upazilaId);
const bloodGroup = firstParam(params.bloodGroup);
const q = firstParam(params.q);
const sort = firstParam(params.sort) as "relevance" | "name" | "newest" | "rating" | undefined;
const user = await getCurrentUser();
const [donors, requests, options, donorProfile] = await Promise.all([
listPublicDonors({ q, divisionId, districtId, upazilaId, bloodGroup, sort }),
listBloodRequests({ q, divisionId, districtId, upazilaId, bloodGroup, sort }),
getDirectoryLocationOptions(),
user ? getDonorForUser(user.id) : Promise.resolve(null),
]);
const donorLabels = await Promise.all(donors.map((donor) => formatLocation(donor)));
const requestLabels = await Promise.all(requests.map((request) => formatLocation(request)));
return (
<div className="blood-theme">
<PageBanner
title="Blood donation"
description="Find voluntary blood donors or post a request. Contact donors who chose to share their phone and WhatsApp details."
media="/images/banner/Blood.webp"
/>
<div className="container-x relative z-10 -mt-4">
<div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 sm:grid-cols-3 sm:p-5">
<div className="rounded-xl bg-accent-50 p-4">
<p className="text-2xl font-bold text-accent-700">{donors.length}</p>
<p className="mt-1 text-sm font-medium text-slate-700">Voluntary donors listed</p>
</div>
<div className="rounded-xl bg-brand-50 p-4">
<p className="text-2xl font-bold text-brand-700">{requests.length}</p>
<p className="mt-1 text-sm font-medium text-slate-700">Active blood requests</p>
</div>
<div className="flex flex-col justify-center rounded-xl bg-slate-50 p-4">
<p className="text-sm font-semibold text-slate-900">One donation can save lives.</p>
<p className="mt-1 text-xs leading-5 text-slate-600">Find a nearby donor or share a verified need with the community.</p>
</div>
</div>
</div>
<div className="container-x py-8">
<div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-accent-700 to-accent-500 p-5 text-white sm:flex-row sm:items-center sm:p-6">
<div>
<h2 className="text-xl font-bold">How can we help today?</h2>
<p className="mt-1 text-sm text-white/85">Browse matching donors and urgent requests, or add your own information.</p>
</div>
<div className="flex flex-wrap gap-2">
<a href="#donors" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-accent-700 hover:bg-accent-50">Find donors</a>
<a href="#request-form" className="rounded-lg border border-white/70 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">Post a request</a>
</div>
</div>
<DirectoryFilters
action="/blood-donation"
params={params}
divisions={options.divisions}
districts={options.districts}
upazilas={options.upazilas}
icon="droplet"
title="Filter donors and requests"
extraSelects={[
{
name: "bloodGroup",
label: "Blood group",
value: bloodGroup,
options: BLOOD_GROUPS.map((group) => ({ value: group, label: group })),
},
]}
current={{ divisionId, districtId, upazilaId }}
/>
<div className="mt-8 grid gap-10 lg:grid-cols-2">
<section id="donors" className="scroll-mt-24">
<div className="mb-4 flex items-center justify-between">
<div><h2 className="text-xl font-semibold text-slate-900">Find a donor</h2><p className="mt-1 text-sm text-slate-500">People who chose to make their donor profile visible.</p></div>
<Badge tone="brand">{donors.length} donors</Badge>
</div>
{donors.length === 0 ? (
<EmptyState
title="No donors match your filters"
description="Choose another blood group or area. Only donors who consented to be listed are shown."
icon={<Icon name="droplet" className="h-10 w-10" />}
/>
) : (
<div className="grid gap-4 sm:grid-cols-2">
{donors.map((donor, index) => (
<DonorCard
key={donor.id}
donor={donor}
locationLabel={donorLabels[index] ?? undefined}
isOwner={donor.userId === user?.id}
action={<DonorContactButtons donorId={donor.id} phone={donor.phone} whatsapp={donor.whatsapp} viewerId={user?.id} />}
/>
))}
</div>
)}
</section>
<section id="requests" className="scroll-mt-24">
<div className="mb-4 flex items-center justify-between">
<div><h2 className="text-xl font-semibold text-slate-900">People who need blood</h2><p className="mt-1 text-sm text-slate-500">Contact requesters directly using their shared contact details.</p></div>
<Badge tone="accent">{requests.length} requests</Badge>
</div>
{requests.length === 0 ? (
<EmptyState
title="No active requests match your filters"
description="Choose another blood group or area."
icon={<Icon name="heart" className="h-10 w-10" />}
/>
) : (
<div className="grid gap-4 sm:grid-cols-2">
{requests.map((request, index) => (
<BloodRequestCard
key={request.id}
request={request}
locationLabel={requestLabels[index] ?? undefined}
action={user?.id === request.requesterId ? (
<CancelRequestButton requestId={request.id} />
) : (
<RequesterContactButtons requestId={request.id} phone={request.phone} whatsapp={request.whatsapp} viewerId={user?.id} />
)}
/>
))}
</div>
)}
</section>
</div>
<Section title="Take part" description="Register as a voluntary donor or post a blood request. Please share accurate information so donors can respond quickly." className="mt-8" contained={false}>
{!user && (
<div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 text-center">
<p className="text-slate-700">You can fill in either form below. Log in or create an account to submit it.</p>
<div className="mt-3 flex flex-wrap justify-center gap-3">
<a href="/login" className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">Login</a>
<a href="/register" className="inline-block rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">Create account</a>
</div>
</div>
)}
<div className="grid gap-8 lg:grid-cols-2">
<div id="donor-form" className="scroll-mt-24 rounded-2xl border border-brand-200 bg-gradient-to-b from-brand-50 to-white p-5 shadow-sm">
<h3 className="font-semibold text-slate-900">Donor registration</h3>
<p className="mt-1 text-sm text-slate-600">
{donorProfile ? "Update your donor profile and availability." : "Register as a voluntary blood donor."}
</p>
<div className="mt-4">
<DonorForm divisions={options.divisions} districts={options.districts} upazilas={options.upazilas} profile={donorProfile} />
</div>
</div>
<div id="request-form" className="scroll-mt-24 rounded-2xl border border-accent-100 bg-gradient-to-b from-accent-50 to-white p-5 shadow-sm">
<h3 className="font-semibold text-slate-900">Post a blood request</h3>
<p className="mt-1 text-sm text-slate-600">Requests are verified before publishing. After the needed date, the request remains available for two days and is then permanently removed at 12:00 PM Bangladesh time.</p>
<div className="mt-4">
<BloodRequestForm divisions={options.divisions} districts={options.districts} upazilas={options.upazilas} />
</div>
</div>
</div>
</Section>
</div>
</div>
); }
