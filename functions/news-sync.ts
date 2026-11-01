const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

type GNewsArticle = {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  image?: string;
  publishedAt?: string;
  source?: { name?: string };
};

type NewsRow = {
  id: string;
  title: string;
  source_url: string | null;
  expires_at: string | null;
};

type StaffRow = { id: string };

async function databaseRequest<T>(
  baseUrl: string,
  apiKey: string,
  table: string,
  options: {
    method?: "GET" | "POST";
    query?: Record<string, string>;
    body?: unknown;
    prefer?: string;
  } = {},
): Promise<T> {
  const url = new URL(
    `/api/database/records/${encodeURIComponent(table)}`,
    baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`,
  );
  for (const [key, value] of Object.entries(options.query ?? {})) {
    url.searchParams.set(key, value);
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.prefer) headers.Prefer = options.prefer;

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const responseText = await response.text();
  let payload: unknown = null;
  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }
  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload !== null && "message" in payload
        ? String((payload as { message: unknown }).message)
        : responseText || response.statusText;
    throw new Error(`InsForge database request failed (${response.status}): ${detail}`);
  }
  return payload as T;
}

function slugFromTitle(title: string, url: string) {
  const suffix = btoa(url).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toLowerCase();
  const base = title.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 70);
  return `news-${base || "update"}-${suffix}`;
}

export default async function (request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  const expectedToken = Deno.env.get("NEWS_SYNC_TOKEN");
  if (!expectedToken || request.headers.get("Authorization") !== `Bearer ${expectedToken}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const baseUrl = Deno.env.get("INSFORGE_BASE_URL");
  const apiKey = Deno.env.get("API_KEY");
  const gnewsKey = Deno.env.get("GNEWS_API_KEY");
  if (!baseUrl || !apiKey || !gnewsKey) {
    return Response.json({ error: "News sync is not configured. Set GNEWS_API_KEY and backend credentials." }, { status: 500, headers: corsHeaders });
  }

  const now = new Date();
  let inserted = 0;
  let requestsCreated = 0;

  const newsUrl = new URL("https://gnews.io/api/v4/search");
  newsUrl.searchParams.set("q", "বাংলাদেশ");
  newsUrl.searchParams.set("lang", "bn");
  newsUrl.searchParams.set("country", "bd");
  newsUrl.searchParams.set("max", "10");
  newsUrl.searchParams.set("sortby", "publishedAt");
  newsUrl.searchParams.set("apikey", gnewsKey);

  const response = await fetch(newsUrl, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    console.error("GNews request failed", response.status);
    return Response.json({ error: "News provider request failed" }, { status: 502, headers: corsHeaders });
  }
  const payload = await response.json() as { articles?: GNewsArticle[] };
  for (const article of payload.articles ?? []) {
    const title = article.title?.trim();
    const sourceUrl = article.url?.trim();
    if (!title || !sourceUrl || !/^https?:\/\//i.test(sourceUrl)) continue;

    const existing = await databaseRequest<Array<{ id: string }>>(baseUrl, apiKey, "news", {
      query: { select: "id", source_url: `eq.${sourceUrl}`, limit: "1" },
    });
    if (existing.length) continue;

    const description = article.description?.trim() || title;
    const fetchedAt = now.toISOString();
    try {
      await databaseRequest<unknown>(baseUrl, apiKey, "news", {
        method: "POST",
        body: [{
          slug: slugFromTitle(title, sourceUrl),
          title: title.slice(0, 200),
          excerpt: description.slice(0, 300),
          body: `${description}\n\nমূল প্রতিবেদনটি পড়ুন: ${sourceUrl}`,
          image: article.image || "/images/news/user.svg",
          category: "national",
          author_id: null,
          source: article.source?.name?.slice(0, 200) || "GNews",
          source_url: sourceUrl,
          external_id: sourceUrl,
          fetched_at: fetchedAt,
          expires_at: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
          status: "published",
          published_at: article.publishedAt || fetchedAt,
        }],
      });
      inserted++;
    } catch (error) {
      // A concurrent sync may insert the same unique source URL after our lookup.
      if (!(error instanceof Error) || !error.message.includes("23505")) throw error;
    }
  }

  // Expired articles remain public until a staff member approves deletion.
  const expired = await databaseRequest<NewsRow[]>(baseUrl, apiKey, "news", {
    query: {
      select: "id,title,source_url,expires_at",
      status: "eq.published",
      expires_at: `lte.${now.toISOString()}`,
    },
  });

  for (const article of expired ?? []) {
    const requestRows = await databaseRequest<Array<{ id: string }>>(
      baseUrl,
      apiKey,
      "news_deletion_requests",
      {
        method: "POST",
        query: { on_conflict: "news_id" },
        prefer: "resolution=ignore-duplicates,return=representation",
        body: [{
          news_id: article.id,
          news_title: article.title,
          source_url: article.source_url,
          expires_at: article.expires_at,
          decision: "pending",
        }],
      },
    );
    const requestRow = requestRows[0];
    if (requestRow) {
      requestsCreated++;
      const staff = await databaseRequest<StaffRow[]>(baseUrl, apiKey, "profiles", {
        query: { select: "id", role: "in.(admin,moderator)" },
      });
      if (staff.length) {
        try {
          await databaseRequest<unknown>(baseUrl, apiKey, "notifications", {
            method: "POST",
            body: staff.map((person) => ({
              user_id: person.id,
              title: "News deletion approval required",
              body: `৪৮ ঘণ্টা পূর্ণ হয়েছে: ${article.title}`,
              href: "/admin/news/deletion-requests",
            })),
          });
        } catch (error) {
          console.error(
            "Deletion request created but admin notification failed",
            error instanceof Error ? error.message : error,
          );
        }
      }
    }
  }

  return Response.json({ inserted, requestsCreated, expiredPending: expired?.length ?? 0 }, { status: 200, headers: corsHeaders });
}
