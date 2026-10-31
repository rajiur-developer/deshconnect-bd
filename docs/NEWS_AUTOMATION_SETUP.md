# DeshConnect automated Bengali news

This feature uses GNews to import Bengali Bangladesh news, keeps imported articles visible for 48 hours from the fetch time, and then creates a separate admin deletion-approval request. An expired article is **not** hidden or deleted until a staff member approves it.

## Required InsForge setup

1. Obtain a GNews API key from https://gnews.io/.
2. Add these InsForge secrets (never put them in a `NEXT_PUBLIC_*` variable):
   - `GNEWS_API_KEY`: the GNews API key.
   - `NEWS_SYNC_TOKEN`: a long random token. Generate one with `openssl rand -hex 32`.
3. Apply the migration in `migrations/20261101090000_automated-news-expiry-approval.sql`.
4. Deploy the function:
   ```bash
   npx @insforge/cli functions deploy news-sync --file functions/news-sync.ts
   ```
5. Create the 30-minute schedule (replace the host with the linked InsForge project's host):
   ```bash
   npx @insforge/cli schedules create \
     --name "DeshConnect Bengali News Sync" \
     --cron "*/30 * * * *" \
     --url "https://qk8ksk3i.us-east.insforge.app/functions/news-sync" \
     --method POST \
     --headers '{"Authorization":"Bearer ${{secrets.NEWS_SYNC_TOKEN}}"}'
   ```
6. Confirm the schedule is active and inspect its logs:
   ```bash
   npx @insforge/cli schedules list
   npx @insforge/cli schedules logs <schedule-id>
   ```

## Runtime behavior

- Fetches up to 10 Bengali-language Bangladesh results per run from GNews.
- Avoids duplicates using the source URL and external ID unique indexes.
- Stores only the provider's headline, short description, source, image URL and link to the original report; it does not copy the full source article.
- Sets `fetched_at` and `expires_at = fetched_at + 48 hours`.
- The public news listing already sorts published news newest-first.
- On/after expiry, creates one row in `news_deletion_requests` and notifies admins/moderators.
- The article remains public while the request is pending.
- Approve permanently deletes the news row; reject leaves the article published. The decision is retained in the separate request table.

The scheduled job will not run until the migration, function deployment, both secrets, and schedule are configured in InsForge.
