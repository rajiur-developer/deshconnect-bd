import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user"; import { insforgeSelectMany } from "@/lib/insforge"; import { mapDbRow } from "@/lib/db/insforge"; import { listPlaces } from "@/services/places"; import { relativeTime } from "@/lib/utils"; import { AccountShell } from "@/components/layout/account-shell"; import { Badge, Card } from "@/components/ui/badge"; import { EmptyState } from "@/components/ui/empty-state"; import { Icon } from "@/components/ui/icons";
export const metadata = { title: "My reviews", robots: { index: false, follow: false } };
export default async function MyReviewsPage() {
const user = await requireUser("/my-reviews");
const [{ data }, placesResult] = await Promise.all([insforgeSelectMany("reviews", { author_id: `eq.${user.id}`, status: "eq.visible", order: "created_at.desc" }), listPlaces({ page: 1, pageSize: 500 })]);
const reviews = mapDbRow(data || []);
const placeById = new Map(placesResult.items.map((place) => [place.id, place]));
return (
<AccountShell user={user} title="My reviews" description="Your reviews of places.">
{reviews.length === 0 ? (
<EmptyState
title="No reviews yet"
description="Visit a place and share your experience."
action={<Link href="/places" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">Visit places</Link>}
icon={<Icon name="star" className="h-10 w-10" />}
/>
) : (
<div className="space-y-3">
{reviews.map((review) => {
const place = placeById.get(review.placeId);
return (
<Card key={review.id} className="p-5">
<div className="flex items-start justify-between gap-3">
<div>
<div className="flex items-center gap-2">
<span className="flex items-center gap-1 text-amber-500">
<Icon name="star" className="h-4 w-4 fill-amber-400 text-amber-400" />
{review.rating}
</span>
<span className="text-xs text-slate-500">{relativeTime(review.createdAt)}</span>
</div>
<h2 className="mt-1 font-semibold text-slate-900">{review.title}</h2>
<p className="mt-1 text-sm text-slate-600">{review.body}</p>
</div>
{place && (
<Link href={`/places/${place.slug}`} className="shrink-0 text-sm font-medium text-brand-700">
View place
</Link>
)}
</div>
{place && <Badge tone="brand" className="mt-3">{place.name}</Badge>}
</Card>
);
})}
</div>
)}
</AccountShell>
); }
