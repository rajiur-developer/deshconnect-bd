-- Anonymous page-view collection for the Website Analytics workspace.
-- No account, email, raw IP address, or precise location is stored.

create table if not exists public.visitor_events (
  id uuid primary key default gen_random_uuid(),
  visitor_key text not null check (visitor_key ~ '^[a-f0-9]{64}$'),
  session_key text not null check (session_key ~ '^[a-f0-9]{64}$'),
  path text not null check (path ~ '^/' and length(path) <= 300 and path not like '/api/%'),
  referrer_host text check (referrer_host is null or length(referrer_host) <= 255),
  device_type text not null default 'unknown' check (device_type in ('mobile', 'tablet', 'desktop', 'unknown')),
  country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  region text check (region is null or length(region) <= 100),
  created_at timestamptz not null default now(),
  minute_bucket timestamptz not null default date_trunc('minute', now())
);

create index if not exists visitor_events_created_at_idx
  on public.visitor_events (created_at desc);
create index if not exists visitor_events_visitor_created_idx
  on public.visitor_events (visitor_key, created_at desc);
create index if not exists visitor_events_path_created_idx
  on public.visitor_events (path, created_at desc);
create unique index if not exists visitor_events_minute_dedupe_idx
  on public.visitor_events (visitor_key, path, minute_bucket);

alter table public.visitor_events enable row level security;

revoke all on public.visitor_events from anon;
revoke all on public.visitor_events from authenticated;

-- Anonymous visitors can append limited, validated page-view fields only.
grant insert (visitor_key, session_key, path, referrer_host, device_type, country_code, region)
  on public.visitor_events to anon, authenticated;

drop policy if exists visitor_events_anon_insert on public.visitor_events;
create policy visitor_events_anon_insert
  on public.visitor_events
  for insert to anon, authenticated
  with check (
    length(visitor_key) = 64
    and length(session_key) = 64
    and path ~ '^/'
    and length(path) <= 300
    and path not like '/api/%'
  );

-- Only existing staff roles can read analytics events.
grant select on public.visitor_events to authenticated;
drop policy if exists visitor_events_staff_read on public.visitor_events;
create policy visitor_events_staff_read
  on public.visitor_events
  for select to authenticated
  using (public.is_current_user_staff());
