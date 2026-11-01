import Link from "next/link";
import { RecordImage } from "@/components/ui/record-image";
import type { Place } from "@/types/content";
import { PLACE_CATEGORIES } from "@/lib/constants";
import { Badge, Card } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";

/** English labels — kept for the admin directory table. */
export function placeCategoryLabel(category: string): string {
  return PLACE_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

/** Bengali labels for public-facing cards and filters. */
export function placeCategoryLabelBn(category: string): string {
  return PLACE_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export function PlaceCard({ place, locationLabel }: { place: Place; locationLabel?: string }) {
  const placeSlug = place.slug?.trim() || `place-${place.id.slice(0, 8)}`;
  const detailsHref = `/places/${placeSlug}`;

  return (
    <Link
      href={detailsHref}
      aria-label={`View details for ${place.name}`}
      className="group block h-full cursor-pointer rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
    >
      <Card className="dc-content-card flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:border-emerald-300 group-hover:shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
          <RecordImage
            src={place.image}
            alt={place.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="pointer-events-none absolute left-3 top-3">
            <Badge tone="brand">{place.categoryName ?? placeCategoryLabelBn(place.category)}</Badge>
          </div>
          {place.verification === "verified" && (
            <div className="pointer-events-none absolute right-3 top-3">
              <Badge tone="success">Verified</Badge>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-base font-semibold text-slate-900 transition-colors duration-300 group-hover:text-emerald-600">
            {place.name}
          </h3>
          {locationLabel && (
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
              <Icon name="map-pin" className="h-3.5 w-3.5" />
              {locationLabel}
            </p>
          )}
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">{place.summary}</p>
          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="flex items-center gap-1 text-sm font-medium text-slate-800">
              <Icon name="star" className="h-4 w-4 fill-amber-400 text-amber-400" />
              {place.rating.toFixed(1)}
              <span className="text-xs font-normal text-slate-400">({place.reviewCount})</span>
            </span>
            <span className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors group-hover:border-emerald-500 group-hover:text-emerald-700">
              View place
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
