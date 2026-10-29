import Link from "next/link";
import { DEFAULT_MAPS_LINK } from "@/lib/constants"; import { Icon } from "@/components/ui/icons";
/**
* Map preview. Uses a Google Maps embed only when an API key is configured;
* otherwise it falls back to an external map link so the page never breaks.
*/ export function MapPreview({
latitude,
longitude,
name,
address, }: {
latitude?: number | null;
longitude?: number | null;
name: string;
address?: string; }) {
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const hasCoordinates = typeof latitude === "number" && typeof longitude === "number";
if (hasCoordinates && apiKey) {
const src = `https://www.google.com/maps?q=${latitude},${longitude}&z=14&output=embed&key=${apiKey}`;
return (
<div className="overflow-hidden rounded-2xl border border-slate-200">
<iframe
title={`Map — ${name}`}
src={src}
className="h-72 w-full border-0"
loading="lazy"
referrerPolicy="no-referrer-when-downgrade"
/>
</div>
);
}
const query = encodeURIComponent(address ? `${name}, ${address}` : name);
return (
<div className="flex h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
<Icon name="map-pin" className="h-8 w-8 text-slate-400" />
<p className="text-sm text-slate-600">
{hasCoordinates ? "Interactive map not available." : "Coordinates not provided for this place."}
</p>
<Link
href={hasCoordinates ? `https://www.google.com/maps?q=${latitude},${longitude}` : `${DEFAULT_MAPS_LINK}/search/?api=1&query=${query}`}
target="_blank"
rel="noreferrer"
className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
>
Open in Google Maps
<Icon name="external" className="h-4 w-4" />
</Link>
</div>
); }
