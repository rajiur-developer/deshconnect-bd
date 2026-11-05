-- Supabase Auth profile bootstrap for DeshConnect.
-- Creates a public profile for every new auth.users row using safe defaults.
-- Existing profiles and existing auth users are not modified.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_email text := lower(coalesce(new.email, ''));
  v_username text;
  v_full_name text;
begin
  if exists (select 1 from public.profiles p where p.id = new.id) then
    return new;
  end if;

  v_full_name := coalesce(
    nullif(btrim(v_meta ->> 'fullName'), ''),
    nullif(btrim(v_meta ->> 'full_name'), ''),
    nullif(btrim(v_meta ->> 'name'), ''),
    nullif(split_part(v_email, '@', 1), ''),
    'Member'
  );

  v_username := lower(regexp_replace(
    coalesce(nullif(btrim(v_meta ->> 'username'), ''), nullif(split_part(v_email, '@', 1), ''), 'member'),
    '[^a-z0-9_]+', '_', 'g'
  ));
  v_username := trim(both '_' from v_username);
  if v_username = '' then v_username := 'member'; end if;
  v_username := left(v_username, 30);

  insert into public.profiles (
    id, username, full_name, email, phone, division_id, district_id, upazila_id,
    role, status, email_verified, terms_accepted_at, blood_group, gender, date_of_birth
  ) values (
    new.id,
    v_username,
    v_full_name,
    v_email,
    nullif(btrim(v_meta ->> 'phone'), ''),
    nullif(btrim(coalesce(v_meta ->> 'divisionId', v_meta ->> 'division_id')), ''),
    nullif(btrim(coalesce(v_meta ->> 'districtId', v_meta ->> 'district_id')), ''),
    nullif(btrim(coalesce(v_meta ->> 'upazilaId', v_meta ->> 'upazila_id')), ''),
    'user',
    'active',
    new.email_confirmed_at is not null,
    case when lower(coalesce(v_meta ->> 'termsAccepted', '')) in ('true', '1', 'yes') then now() else null end,
    nullif(btrim(coalesce(v_meta ->> 'bloodGroup', v_meta ->> 'blood_group')), ''),
    nullif(btrim(v_meta ->> 'gender'), ''),
    case
      when coalesce(v_meta ->> 'dateOfBirth', v_meta ->> 'date_of_birth', '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      then (coalesce(v_meta ->> 'dateOfBirth', v_meta ->> 'date_of_birth'))::date
      else null
    end
  )
  on conflict do nothing;

  if not exists (select 1 from public.profiles p where p.id = new.id) then
    v_username := left(v_username, 22) || '_' || right(replace(new.id::text, '-', ''), 6);
    insert into public.profiles (id, username, full_name, email, role, status, email_verified)
    values (new.id, v_username, v_full_name, v_email, 'user', 'active', new.email_confirmed_at is not null)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.sync_auth_email_verified()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is distinct from old.email_confirmed_at
     and new.email_confirmed_at is not null then
    update public.profiles
       set email_verified = true,
           updated_at = now()
     where id = new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.sync_auth_email_verified() from public, anon, authenticated;

drop trigger if exists on_auth_user_email_verified on auth.users;
create trigger on_auth_user_email_verified
after update of email_confirmed_at on auth.users
for each row execute function public.sync_auth_email_verified();
