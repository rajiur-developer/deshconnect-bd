/** Convert Postgres rows (snake_case) into the app's camelCase record shape. */
export function mapDbRow<T = any>(value: any): T {
  if (Array.isArray(value)) return value.map((item) => mapDbRow(item)) as T;
  if (!value || typeof value !== "object") return value as T;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase()),
      item && typeof item === "object" ? mapDbRow(item) : item,
    ]),
  ) as T;
}
