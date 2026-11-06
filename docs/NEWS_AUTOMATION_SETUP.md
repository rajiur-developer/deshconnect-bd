# DeshConnect automated Bengali news

This feature imports Bengali Bangladesh news through GNews, keeps imported articles visible for 48 hours from fetch time, and then creates an admin deletion-approval request. An expired article is **not** hidden or deleted until a staff member approves it.

## Supabase setup

1. Obtain a GNews API key from https://gnews.io/.
2. Set the Edge Function secrets in the linked Supabase project (never use `NEXT_PUBLIC_*` variables):
   ```bash
   supabase secrets set GNEWS_API_KEY=YOUR_GNEWS_API_KEY NEWS_SYNC_TOKEN=YOUR_LONG_RANDOM_TOKEN --project-ref eqxqlblyanfgghygofsj
   ```
   Generate a token locally with `openssl rand -hex 32`. Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions automatically.
3. Apply the database migration:
   ```bash
   supabase db push --project-ref eqxqlblyanfgghygofsj
   ```
   The migration adds the external source fields, a unique source URL index, the approval queue, and the staff-only decision RPC.
4. Deploy the function:
   ```bash
   supabase functions deploy news-sync --project-ref eqxqlblyanfgghygofsj --no-verify-jwt
   ```
   The function validates `NEWS_SYNC_TOKEN` itself. Do not expose this token in browser code.
5. Schedule a POST every 30 minutes to:
   `https://eqxqlblyanfgghygofsj.supabase.co/functions/v1/news-sync`
   with header `Authorization: Bearer YOUR_NEWS_SYNC_TOKEN`. Store the token in the scheduler's secret store; never put it in source control or a public environment variable.

## Runtime behavior

- Fetches up to 10 Bengali-language Bangladesh results per run from GNews.
- Avoids duplicates using unique source URL and external ID indexes.
- Stores the provider's headline, short description, source, image URL and original article link; it does not copy the full source article.
- Sets `fetched_at` and `expires_at = fetched_at + 48 hours`.
- After expiry, creates one row in `news_deletion_requests` and notifies admins/moderators.
- The article remains public while the request is pending.
- Approve permanently deletes the news row; reject leaves the article published. The decision is retained in the separate request table.

The scheduled job will not run until the GNews key, function token, function deployment, and 30-minute schedule are configured in Supabase.
