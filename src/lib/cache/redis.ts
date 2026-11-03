import "server-only";

type RedisResponse<T> = { result?: T; error?: string };

function redisSettings() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  return url && token ? { url, token } : null;
}

async function command<T>(settings: { url: string; token: string }, parts: Array<string | number>): Promise<T> {
  const response = await fetch(settings.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parts),
    cache: "no-store",
    signal: AbortSignal.timeout(2_500),
  });
  if (!response.ok) throw new Error(`Upstash returned HTTP ${response.status}.`);
  const payload = await response.json() as RedisResponse<T>;
  if (payload.error) throw new Error(payload.error);
  return payload.result as T;
}

/** Cache only public, non-user-specific data. Falls back to the loader on Redis outages. */
export async function getOrSetRedisJson<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const settings = redisSettings();
  if (!settings) return loader();

  const cacheKey = `deshconnect:cache:${key}`;
  try {
    const cached = await command<string | null>(settings, ["GET", cacheKey]);
    if (typeof cached === "string") return JSON.parse(cached) as T;
  } catch {
    // A cache failure must never prevent the underlying database read.
  }

  const value = await loader();
  try {
    await command(settings, ["SET", cacheKey, JSON.stringify(value), "EX", Math.max(1, Math.floor(ttlSeconds))]);
  } catch {
    // Return the fresh value even when Redis cannot store it.
  }
  return value;
}
