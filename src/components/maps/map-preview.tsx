import Link from "next/link";
import { Icon } from "@/components/ui/icons";

/**
 * OpenStreetMap preview for a saved, verified coordinate pair.
 * No Google Maps API key is required.
 */
export function MapPreview({
  latitude,
  longitude,
  name,
  address,
}: {
  latitude?: number | null;
  longitude?: number | null;
  name: string;
  address?: string;
}) {
  const hasCoordinates =
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);

  if (hasCoordinates) {
    const padding = 0.008;
    const bbox = [
      (longitude as number) - padding,
      (latitude as number) - padding,
      (longitude as number) + padding,
      (latitude as number) + padding,
    ].join(",");
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude}%2C${longitude}`;
    const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <iframe
          title={`OpenStreetMap — ${name}`}
          src={src}
          className="h-72 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-3 py-2">
          <span className="text-xs text-slate-500">© OpenStreetMap contributors</span>
          <Link href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-800">
            Open map <Icon name="external" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const query = encodeURIComponent(address ? `${name}, ${address}` : name);
  return (
    <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
      <Icon name="map-pin" className="h-8 w-8 text-slate-400" />
      <p className="text-sm text-slate-600">এই স্থানের সঠিক coordinates এখনো সংরক্ষণ করা হয়নি।</p>
      <Link
        href={`https://www.openstreetmap.org/search?query=${query}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
      >
        Search on OpenStreetMap
        <Icon name="external" className="h-4 w-4" />
      </Link>
    </div>
  );
}
