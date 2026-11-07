import { expandSearchTerms } from "@/lib/search-transliteration";

/** Add a PostgREST OR filter that searches multiple text columns and scripts. */
export function addTextSearch(
  params: Record<string, string>,
  query: string | undefined,
  fields: string[],
) {
  const terms = expandSearchTerms(query ?? "")
    .map((term) => term.replace(/[(),]/g, " ").replace(/[%_*]/g, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (!terms.length || !fields.length) return;
  const clauses = terms.flatMap((term) => {
    const pattern = `*${term}*`;
    return fields.map((field) => `${field}.ilike.${pattern}`);
  });
  params.or = clauses.join(",");
}

export function makePageMeta(total: number, page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    total,
    page,
    pageSize,
    totalPages,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}
