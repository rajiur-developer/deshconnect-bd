import Link from "next/link";
import { requireUser } from "@/lib/auth/current-user"; import { listSavedPlaces } from "@/services/places"; import { AccountShell } from "@/components/layout/account-shell"; import { EmptyState } from "@/components/ui/empty-state"; import { Icon } from "@/components/ui/icons"; import { PlaceCard } from "@/components/cards/place-card"; import { ListGrid } from "@/components/layout/list-grid";
export const metadata = { title: "Saved places", robots: { index: false, follow: false } };
export default async function SavedPage() {
const user = await requireUser("/saved");
const places = await listSavedPlaces(user.id);
return (
<AccountShell user={user} title="Saved places" description="Places you saved to view later.">
{places.length === 0 ? (
<EmptyState
title="Nothing saved yet"
description="Save a place from any detail page, and it will appear here."
action={<Link href="/places" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">Visit places</Link>}
icon={<Icon name="save" className="h-10 w-10" />}
/>
) : (
<ListGrid>
{places.map((place) => (
<div key={place.id} className="relative">
<PlaceCard place={place} />
</div>
))}
</ListGrid>
)}
</AccountShell>
); }
