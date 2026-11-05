-- Prevent self-promotion through public.profiles and preserve trusted Auth bootstrap.
create or replace function public.guard_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = ''
set row_security = 'off'
as $$
begin
  if current_setting('app.profile_bootstrap', true) = 'true' then return new; end if;
  if tg_op = 'INSERT' then
    if auth.uid() is null or new.id is distinct from auth.uid() then
      raise exception 'Profile can only be created for the signed-in user' using errcode = '42501';
    end if;
    new.role := 'user';
    new.status := 'active';
    new.email := lower(coalesce(auth.jwt() ->> 'email', new.email));
    new.email_verified := coalesce((auth.jwt() ->> 'email_verified')::boolean, false);
  elsif (
    new.role is distinct from old.role
    or new.status is distinct from old.status
    or new.email_verified is distinct from old.email_verified
    or new.email is distinct from old.email
  ) and not public.is_current_user_staff() then
    raise exception 'Only staff can change protected account fields' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_profile_privileges() from public, anon, authenticated;
drop trigger if exists guard_profile_privileges on public.profiles;
create trigger guard_profile_privileges before insert or update on public.profiles
for each row execute function public.guard_profile_privileges();

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_email text := lower(coalesce(new.email, ''));
  v_base text;
  v_username text;
  v_full_name text;
  v_role text;
  v_date text;
begin
  if exists (select 1 from public.profiles where id = new.id) then return new; end if;
  v_full_name := left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'fullName'), ''), nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), nullif(btrim(new.raw_user_meta_data ->> 'name'), ''), nullif(split_part(v_email, '@', 1), ''), 'Member'), 120);
  v_base := lower(regexp_replace(coalesce(nullif(split_part(v_email, '@', 1), ''), 'member'), '[^a-z0-9_]+', '_', 'g'));
  v_base := trim(both '_' from v_base);
  if length(v_base) < 3 then v_base := 'member'; end if;
  v_base := left(v_base, 17);
  v_username := v_base || '_' || right(replace(new.id::text, '-', ''), 6);
  v_role := case when v_email = 'rajiurrahman21@gmail.com' then 'admin' else 'user' end;
  v_date := coalesce(new.raw_user_meta_data ->> 'dateOfBirth', new.raw_user_meta_data ->> 'date_of_birth', '');
  perform set_config('app.profile_bootstrap', 'true', true);
  insert into public.profiles (id,username,full_name,email,role,status,email_verified,phone,division_id,district_id,upazila_id,terms_accepted_at,blood_group,gender,date_of_birth)
  values (new.id,left(v_username,24),v_full_name,v_email,v_role,'active',new.email_confirmed_at is not null,
    nullif(btrim(new.raw_user_meta_data ->> 'phone'),''),
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'divisionId',new.raw_user_meta_data ->> 'division_id')),'')::uuid,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'districtId',new.raw_user_meta_data ->> 'district_id')),'')::uuid,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'upazilaId',new.raw_user_meta_data ->> 'upazila_id')),'')::uuid,
    case when lower(coalesce(new.raw_user_meta_data ->> 'termsAccepted','')) in ('true','1','yes') then now() else null end,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'bloodGroup',new.raw_user_meta_data ->> 'blood_group')),''),
    nullif(btrim(new.raw_user_meta_data ->> 'gender'),''),
    case when v_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then v_date::date else null end)
  on conflict (id) do nothing;
  perform set_config('app.profile_bootstrap', 'false', true);
  return new;
exception when unique_violation then
  perform set_config('app.profile_bootstrap', 'true', true);
  v_username := left(v_base,17) || '_' || right(replace(new.id::text,'-',''),6);
  insert into public.profiles (id,username,full_name,email,role,status,email_verified)
  values (new.id,left(v_username,24),v_full_name,v_email,v_role,'active',new.email_confirmed_at is not null)
  on conflict (id) do nothing;
  perform set_config('app.profile_bootstrap', 'false', true);
  return new;
end;
$$;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

create or replace function public.sync_auth_email_verified()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.email_confirmed_at is distinct from old.email_confirmed_at and new.email_confirmed_at is not null then
    perform set_config('app.profile_bootstrap','true',true);
    update public.profiles set email_verified=true,updated_at=now() where id=new.id;
    perform set_config('app.profile_bootstrap','false',true);
  end if;
  return new;
end;
$$;
revoke all on function public.sync_auth_email_verified() from public, anon, authenticated;
