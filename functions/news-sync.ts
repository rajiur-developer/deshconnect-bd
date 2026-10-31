import { createAdminClient } from "npm:@insforge/sdk";

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

  const admin = createAdminClient({ baseUrl, apiKey });
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
    const { data: existing, error: lookupError } = await admin.database
      .from("news").select("id").eq("source_url", sourceUrl).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) continue;

    const description = article.description?.trim() || title;
    const fetchedAt = now.toISOString();
    const { error } = await admin.database.from("news").insert([{
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
    }]);
    if (error && error.code !== "23505") throw error;
    if (!error) inserted++;
  }

  // Expired articles remain public until a staff member approves deletion.
  const { data: expired, error: expiredError } = await admin.database
    .from("news")
    .select("id,title,source_url,expires_at")
    .eq("status", "published")
    .lte("expires_at", now.toISOString());
  if (expiredError) throw expiredError;

  for (const article of expired ?? []) {
    const { data: requestRow, error: requestError } = await admin.database
      .from("news_deletion_requests")
      .upsert([{
        news_id: article.id,
        news_title: article.title,
        source_url: article.source_url,
        expires_at: article.expires_at,
        decision: "pending",
      }], { onConflict: "news_id", ignoreDuplicates: true })
      .select("id").maybeSingle();
    if (requestError) throw requestError;
    if (requestRow) {
      requestsCreated++;
      const { data: staff, error: staffError } = await admin.database
        .from("profiles").select("id").in("role", ["admin", "moderator"]);
      if (staffError) throw staffError;
      if (staff?.length) {
        const { error: notificationError } = await admin.database.from("notifications").insert(
          staff.map((person: { id: string }) => ({
            user_id: person.id,
            title: "News deletion approval required",
            body: `৪৮ ঘণ্টা পূর্ণ হয়েছে: ${article.title}`,
            href: "/admin/news/deletion-requests",
          })),
        );
        if (notificationError) console.error("Deletion request created but admin notification failed", notificationError.message);
      }
    }
  }

  return Response.json({ inserted, requestsCreated, expiredPending: expired?.length ?? 0 }, { status: 200, headers: corsHeaders });
}
