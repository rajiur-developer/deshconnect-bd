import type { Metadata } from "next"; import Image from "next/image"; import Link from "next/link"; import { notFound } from "next/navigation"; import { EmptyRecordPage } from "@/components/layout/empty-record-page";
import { getPlaceBySlug, getReviewsForPlace, isPlaceSaved } from "@/services/places"; import { formatLocation } from "@/services/locations"; import { listUsers } from "@/services/users"; import { getCurrentUser } from "@/lib/auth/current-user"; import { formatDate, relativeTime } from "@/lib/utils"; import { Badge } from "@/components/ui/badge"; import { Icon } from "@/components/ui/icons"; import { MapPreview } from "@/components/maps/map-preview"; import { SaveButton } from "@/components/places/save-button"; import { ReviewForm } from "@/components/places/review-form";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
const { slug } = await params;
const place = await getPlaceBySlug(slug);
if (!place) return { title: "Place not found" };
return {
title: place.name,
description: place.summary,
alternates: { canonical: `/places/${place.slug}` },
openGraph: { title: place.name, description: place.summary, images: [place.image] },
}; }
export default async function PlaceDetailPage({ params }: Props) {
const { slug } = await params;
const place = await getPlaceBySlug(slug);
if (!place) return <EmptyRecordPage title="Place details" description="Explore places and tourism in Bangladesh." media="/images/banner/Travel.webp" backHref="/places" backLabel="Browse places" />;
const user = await getCurrentUser();
const [reviews, locationLabel, saved, users] = await Promise.all([
getReviewsForPlace(place.id),
formatLocation(place),
user ? isPlaceSaved(user.id, place.id) : Promise.resolve(false),
listUsers(),
]);
const authorById = new Map(users.map((item) => [item.id, item]));
const jsonLd: Record<string, unknown> = {
"@context": "https://schema.org",
"@type": "TouristAttraction",
name: place.name,
description: place.summary,
address: place.address,
};
if (typeof place.latitude === "number" && typeof place.longitude === "number") {
jsonLd.geo = { "@type": "GeoCoordinates", latitude: place.latitude, longitude: place.longitude };
}
if (place.reviewCount > 0) {
jsonLd.aggregateRating = { "@type": "AggregateRating", ratingValue: place.rating, reviewCount: place.reviewCount };
}
const facts: Array<{ label: string; value?: string }> = [
{ label: "Opening hours", value: place.openingHours },
{ label: "Entry fee", value: place.entryFee },
{ label: "Best time to visit", value: place.bestTime },
{ label: "Last verified", value: place.lastCheckedAt ? formatDate(place.lastCheckedAt) : undefined },
].filter((fact) => Boolean(fact.value));
return (
<>
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
<div className="container-x py-8">
<div className="grid gap-8 lg:grid-cols-3">
<div className="lg:col-span-2">
<div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
<Image src={place.image} alt={place.name} fill priority sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" />
</div>
<div className="mt-4 flex flex-wrap items-center gap-2">
<Badge tone="brand">{place.categoryName ?? place.category}</Badge>
{place.verification === "verified" && <Badge tone="success">Verified listing</Badge>}
{place.source && <Badge tone="neutral">Source: {place.source}</Badge>}
</div>
<h1 className="mt-3 text-3xl font-bold text-slate-900">{place.name}</h1>
<div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
<span className="flex items-center gap-1">
<Icon name="star" className="h-4 w-4 fill-amber-400 text-amber-400" />
{place.rating.toFixed(1)} ({place.reviewCount} reviews)
</span>
{locationLabel && (
<span className="flex items-center gap-1">
<Icon name="map-pin" className="h-4 w-4 text-slate-400" />
{locationLabel}
</span>
)}
</div>
<p className="mt-4 text-lg text-slate-700">{place.summary}</p>
<div className="prose-body mt-4 text-slate-700">
{place.description.split("\n").map((paragraph, index) => (
<p key={index}>{paragraph}</p>
))}
</div>
{facts.length > 0 && (
<dl className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
{facts.map((fact) => (
<div key={fact.label}>
<dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{fact.label}</dt>
<dd className="mt-1 text-sm text-slate-900">{fact.value}</dd>
</div>
))}
</dl>
)}
<div className="mt-8">
<h2 className="text-xl font-semibold text-slate-900">Location</h2>
<p className="mt-1 text-sm text-slate-600">{place.address}</p>
<div className="mt-4">
<MapPreview latitude={place.latitude} longitude={place.longitude} name={place.name} address={place.address} />
</div>
</div>
</div>
<aside className="space-y-6">
<div className="rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">Save this place</h2>
<p className="mt-1 text-sm text-slate-600">Keep it in your list for later.</p>
<div className="mt-4">
{user ? (
<SaveButton placeId={place.id} initialSaved={saved} />
) : (
<Link href={`/login?next=${encodeURIComponent(`/places/${place.slug}`)}`} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
<Icon name="save" className="h-4 w-4" />
Log in to save
</Link>
)}
</div>
</div>
{place.gallery && place.gallery.length > 1 && (
<div className="rounded-2xl border border-slate-200 bg-white p-5">
<h2 className="font-semibold text-slate-900">Gallery</h2>
<div className="mt-3 grid grid-cols-3 gap-2">
{place.gallery.slice(0, 6).map((src) => (
<div key={src} className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
<Image src={src} alt={place.name} fill sizes="120px" className="object-cover" />
</div>
))}
</div>
</div>
)}
</aside>
</div>
<section className="mt-12">
<h2 className="text-xl font-semibold text-slate-900">Reviews ({reviews.length})</h2>
<div className="mt-4 grid gap-6 lg:grid-cols-2">
<div className="space-y-4">
{reviews.length === 0 && (
<p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
No reviews yet. Be the first to share your experience.
</p>
)}
{reviews.map((review) => {
const author = authorById.get(review.authorId);
return (
<article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
{author ? author.fullName.slice(0, 2).toUpperCase() : "?"}
</span>
<div>
<p className="text-sm font-medium text-slate-900">{author?.fullName ?? "Community member"}</p>
<p className="text-xs text-slate-500">{relativeTime(review.createdAt)}</p>
</div>
</div>
<span className="flex items-center gap-1 text-sm text-amber-500">
<Icon name="star" className="h-4 w-4 fill-amber-400 text-amber-400" />
{review.rating}
</span>
</div>
<h3 className="mt-3 text-sm font-semibold text-slate-900">{review.title}</h3>
<p className="mt-1 text-sm text-slate-600">{review.body}</p>
</article>
);
})}
</div>
<div>{user ? <ReviewForm placeId={place.id} slug={place.slug} /> : (
<div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
<p>Log in to write a review.</p>
<Link href="/login" className="mt-2 inline-block font-medium text-brand-700">Login →</Link>
</div>
)}</div>
</div>
</section>
</div>
</>
); }
