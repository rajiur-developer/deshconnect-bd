-- Reassert read-only public views and least-privilege anonymous analytics.
-- This migration is safe to re-run.

revoke all privileges on table public.public_profiles from anon, authenticated;
grant select on table public.public_profiles to anon, authenticated;

revoke all privileges on table public.public_blood_donors from anon, authenticated;
grant select on table public.public_blood_donors to anon, authenticated;

alter table public.visitor_events enable row level security;
revoke all privileges on table public.visitor_events from anon, authenticated;

-- Anonymous visitors may submit only the fields used by the page-view collector.
-- Server-generated id, created_at and minute_bucket cannot be spoofed.
grant insert (visitor_key, session_key, path, referrer_host, device_type, country_code, region)
  on public.visitor_events to anon, authenticated;
grant select on public.visitor_events to authenticated;

drop policy if exists visitor_events_anon_insert on public.visitor_events;
create policy visitor_events_anon_insert
  on public.visitor_events
  for insert to anon
  with check (
    visitor_key ~ '^[a-f0-9]{64}$'
    and session_key ~ '^[a-f0-9]{64}$'
    and path ~ '^/'
    and length(path) <= 300
    and path not like '/api/%'
  );

drop policy if exists visitor_events_authenticated_insert on public.visitor_events;
create policy visitor_events_authenticated_insert
  on public.visitor_events
  for insert to authenticated
  with check (
    visitor_key ~ '^[a-f0-9]{64}$'
    and session_key ~ '^[a-f0-9]{64}$'
    and path ~ '^/'
    and length(path) <= 300
    and path not like '/api/%'
  );

drop policy if exists visitor_events_staff_read on public.visitor_events;
create policy visitor_events_staff_read
  on public.visitor_events
  for select to authenticated
  using (public.is_current_user_staff());

-- Private record attachments support the MIME types accepted by the app.
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'audio/webm',
  'audio/mp4',
  'audio/mpeg',
  'audio/ogg',
  'audio/wav',
  'audio/aac',
  'audio/x-wav'
]
where id = 'record-attachments';
