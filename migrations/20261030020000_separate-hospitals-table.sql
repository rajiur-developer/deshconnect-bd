-- Create dedicated hospitals table
create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null,
  address text not null,
  phone text,
  email text,
  website text,
  emergency_phone text,
  latitude float8,
  longitude float8,
  image text not null,
  verification text not null default 'unverified',
  source text,
  division_id text references public.divisions(id),
  district_id text references public.districts(id),
  upazila_id text references public.upazilas(id),
  status text not null default 'published',
  last_checked_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists hospitals_location_idx on public.hospitals (division_id, district_id, upazila_id);
create index if not exists hospitals_category_idx on public.hospitals (category);
create index if not exists hospitals_status_idx on public.hospitals (status);

-- Migrate existing hospital records from institutions if any exist
insert into public.hospitals (
  id, slug, name, category, description, address, phone, email, website,
  emergency_phone, latitude, longitude, image, verification, source,
  division_id, district_id, upazila_id, status, last_checked_at, created_at, updated_at
)
select
  id, slug, name, category, description, address, phone, email, website,
  emergency_phone, latitude, longitude, image, verification, source,
  division_id, district_id, upazila_id, status, last_checked_at, created_at, updated_at
from public.institutions
where category in ('hospital', 'health-centre')
on conflict (id) do nothing;

delete from public.institutions where category in ('hospital', 'health-centre');

-- Security and RLS
alter table public.hospitals enable row level security;
grant select on public.hospitals to anon, authenticated;
grant select, insert, update, delete on public.hospitals to authenticated;

drop policy if exists hospitals_published_read on public.hospitals;
create policy hospitals_published_read on public.hospitals for select using (status = 'published');

drop policy if exists hospitals_staff_access on public.hospitals;
create policy hospitals_staff_access on public.hospitals for all to authenticated using (public.is_current_user_staff());

