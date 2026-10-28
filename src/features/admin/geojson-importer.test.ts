import { describe, expect, it } from "vitest";
import { previewOpenStreetMapGeoJson } from "./geojson-importer";

describe("previewOpenStreetMapGeoJson", () => {
  it("maps a named OSM hospital point", () => {
    const result = previewOpenStreetMapGeoJson({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        id: "node/123",
        properties: { amenity: "hospital", name: "Test Hospital" },
        geometry: { type: "Point", coordinates: [88.1, 26.2] },
      }],
    });
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      sourceKey: "osm:node:123",
      name: "Test Hospital",
      category: "hospital",
      latitude: 26.2,
      longitude: 88.1,
    });
  });

  it("skips news and unrelated features", () => {
    const result = previewOpenStreetMapGeoJson({
      type: "FeatureCollection",
      features: [{
        type: "Feature",
        id: "node/456",
        properties: { name: "Example News", news: "yes" },
        geometry: { type: "Point", coordinates: [88.1, 26.2] },
      }],
    });
    expect(result.rows).toHaveLength(0);
    expect(result.skipped).toHaveLength(1);
  });

  it("skips features without names or valid coordinates", () => {
    const result = previewOpenStreetMapGeoJson({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "node/1",
          properties: { amenity: "hospital" },
          geometry: { type: "Point", coordinates: [88.1, 26.2] },
        },
        {
          type: "Feature",
          id: "node/2",
          properties: { amenity: "hospital", name: "No coordinates" },
          geometry: null,
        },
      ],
    });
    expect(result.rows).toHaveLength(0);
    expect(result.skipped).toHaveLength(2);
  });

  it("rejects a non-FeatureCollection input", () => {
    expect(() => previewOpenStreetMapGeoJson({ type: "Feature", features: [] }))
      .toThrow("FeatureCollection");
  });
});
