/**
 * OpenStreetMap GeoJSON validation and mapping helpers for DeshConnect.
 *
 * This module intentionally does not write to the database. Import previews
 * must be reviewed before a later server-side, staff-authorized import action.
 * OSM attribution: © OpenStreetMap contributors.
 */

export type GeoJsonProperties = Record<string, unknown>;

export type GeoJsonFeature = {
  type: "Feature";
  id?: string | number;
  properties?: GeoJsonProperties | null;
  geometry?: {
    type: string;
    coordinates?: unknown;
  } | null;
};

export type GeoJsonInput = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

export type ImportCategory = "hospital" | "health-centre" | "school" | "college" | "university" | "kindergarten" | "education-centre" | "place";

export type GeoJsonImportRow = {
  sourceKey: string;
  source: "OpenStreetMap";
  name: string;
  category: ImportCategory;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
  website?: string;
  phone?: string;
  osmType?: string;
  osmId?: string;
};

export type GeoJsonImportIssue = {
  index: number;
  reason: string;
};

export type GeoJsonPreview = {
  rows: GeoJsonImportRow[];
  skipped: GeoJsonImportIssue[];
  duplicates: GeoJsonImportIssue[];
};

const OSM_ATTRIBUTION = "© OpenStreetMap contributors";

function asText(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function getTags(properties: GeoJsonProperties): GeoJsonProperties {
  const tags = properties.tags;
  return tags && typeof tags === "object" && !Array.isArray(tags)
    ? (tags as GeoJsonProperties)
    : properties;
}

function getCoordinate(feature: GeoJsonFeature): [number, number] | null {
  const geometry = feature.geometry;
  if (!geometry) return null;

  let coordinates: unknown = geometry.coordinates;
  if (geometry.type === "Point" && Array.isArray(coordinates)) {
    const [longitude, latitude] = coordinates;
    if (typeof latitude === "number" && typeof longitude === "number") {
      return Number.isFinite(latitude) && Number.isFinite(longitude)
        && latitude >= -90 && latitude <= 90
        && longitude >= -180 && longitude <= 180
        ? [latitude, longitude]
        : null;
    }
  }

  // Overpass GeoJSON may represent ways/relations as polygon geometry. Use a
  // valid explicit center when provided in properties; never guess a centroid.
  const props = feature.properties ?? {};
  const center = props.center;
  if (center && typeof center === "object") {
    const c = center as Record<string, unknown>;
    const lat = c.lat;
    const lon = c.lon;
    if (typeof lat === "number" && typeof lon === "number"
      && Number.isFinite(lat) && Number.isFinite(lon)
      && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return [lat, lon];
    }
  }
  return null;
}

function categorize(tags: GeoJsonProperties): ImportCategory | null {
  const amenity = asText(tags.amenity).toLowerCase();
  const healthcare = asText(tags.healthcare).toLowerCase();
  const building = asText(tags.building).toLowerCase();
  const isEducation = ["school", "college", "university", "kindergarten"].includes(amenity)
    || ["school", "college", "university", "kindergarten"].includes(building)
    || Boolean(tags["isced:level"]);

  if (amenity === "hospital" || healthcare === "hospital") return "hospital";
  if (["clinic", "doctors", "centre", "center", "health_post", "nursing_home"].includes(healthcare)
    || ["clinic", "doctors"].includes(amenity)) return "health-centre";
  if (amenity === "school" || building === "school") return "school";
  if (amenity === "college" || building === "college") return "college";
  if (amenity === "university" || building === "university") return "university";
  if (amenity === "kindergarten" || building === "kindergarten") return "kindergarten";
  if (isEducation) return "education-centre";

  // General places are accepted only when there is a name and a recognized
  // place/tourism tag. News, posts, and unrelated objects are never imported.
  if (tags.tourism || tags.historic || tags.leisure || tags.natural || tags.waterway === "waterfall") return "place";
  return null;
}

function getSourceIdentity(feature: GeoJsonFeature, props: GeoJsonProperties): { key: string; type?: string; id?: string } {
  const rawId = asText(props["@id"]) || asText(feature.id) || asText(props.id);
  const explicitType = asText(props.type).toLowerCase();
  const match = rawId.match(/^(node|way|relation)\/(\d+)$/);
  const type = match?.[1] || explicitType || undefined;
  const id = match?.[2] || (rawId && /^\d+$/.test(rawId) ? rawId : undefined);
  if (type && id) return { key: `osm:${type}:${id}`, type, id };
  return { key: `feature:${rawId || "index-unknown"}`, type, id };
}

export function previewOpenStreetMapGeoJson(input: unknown): GeoJsonPreview {
  if (!input || typeof input !== "object") throw new Error("GeoJSON ফাইলের কাঠামো সঠিক নয়।");
  const collection = input as Partial<GeoJsonInput>;
  if (collection.type !== "FeatureCollection" || !Array.isArray(collection.features)) {
    throw new Error("ফাইলে type: FeatureCollection এবং features array থাকতে হবে।");
  }
  if (collection.features.length > 10000) {
    throw new Error("একবারে সর্বোচ্চ ১০,০০০টি feature যাচাই করা যাবে। ছোট ফাইল বা জেলা অনুযায়ী ভাগ করুন।");
  }

  const rows: GeoJsonImportRow[] = [];
  const skipped: GeoJsonImportIssue[] = [];
  const duplicates: GeoJsonImportIssue[] = [];
  const seen = new Set<string>();

  collection.features.forEach((feature, index) => {
    if (!feature || feature.type !== "Feature") {
      skipped.push({ index, reason: "Feature কাঠামো সঠিক নয়" });
      return;
    }
    const properties = feature.properties && typeof feature.properties === "object"
      ? feature.properties
      : {};
    const tags = getTags(properties);
    const name = asText(tags.name) || asText(tags["name:en"]) || asText(tags["name:bn"]);
    if (!name) {
      skipped.push({ index, reason: "নাম নেই" });
      return;
    }

    const category = categorize(tags);
    if (!category) {
      skipped.push({ index, reason: "অনুমোদিত place/health/education ক্যাটাগরি নয়" });
      return;
    }
    const coordinate = getCoordinate(feature);
    if (!coordinate) {
      skipped.push({ index, reason: "বৈধ latitude/longitude পাওয়া যায়নি" });
      return;
    }

    const identity = getSourceIdentity(feature, properties);
    if (seen.has(identity.key)) {
      duplicates.push({ index, reason: `একই OSM পরিচয় পুনরাবৃত্ত: ${identity.key}` });
      return;
    }
    seen.add(identity.key);

    const addressParts = [
      asText(tags["addr:housenumber"]),
      asText(tags["addr:street"]),
      asText(tags["addr:suburb"]),
      asText(tags["addr:city"]),
      asText(tags["addr:district"]),
      asText(tags["addr:state"]),
    ].filter(Boolean);
    const website = asText(tags.website) || asText(tags["contact:website"]);
    const phone = asText(tags.phone) || asText(tags["contact:phone"]);
    const description = [
      asText(tags.description),
      `Source: OpenStreetMap (${OSM_ATTRIBUTION})`,
    ].filter(Boolean).join(" — ");

    rows.push({
      sourceKey: identity.key,
      source: "OpenStreetMap",
      name,
      category,
      latitude: coordinate[0],
      longitude: coordinate[1],
      address: addressParts.join(", ") || asText(tags["addr:full"]) || "",
      description,
      ...(website ? { website } : {}),
      ...(phone ? { phone } : {}),
      ...(identity.type ? { osmType: identity.type } : {}),
      ...(identity.id ? { osmId: identity.id } : {}),
    });
  });

  return { rows, skipped, duplicates };
}
