create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare
  v_email text := lower(coalesce(new.email, ''));
  v_base text;
  v_username text;
  v_requested_username text;
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
  v_requested_username := lower(btrim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  if v_requested_username ~ '^[a-z0-9_]{3,24}$' then v_username := v_requested_username;
  else v_username := left(v_base || '_' || right(replace(new.id::text, '-', ''), 6), 24); end if;
  v_role := case when v_email = 'rajiurrahman21@gmail.com' and new.email_confirmed_at is not null then 'admin' else 'user' end;
  v_date := coalesce(new.raw_user_meta_data ->> 'dateOfBirth', new.raw_user_meta_data ->> 'date_of_birth', '');
  perform set_config('app.profile_bootstrap', 'true', true);
  insert into public.profiles (id,username,full_name,email,role,status,email_verified,phone,division_id,district_id,upazila_id,terms_accepted_at,blood_group,gender,date_of_birth)
  values (new.id,v_username,v_full_name,v_email,v_role,'active',new.email_confirmed_at is not null,
    nullif(btrim(new.raw_user_meta_data ->> 'phone'),''),
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'divisionId',new.raw_user_meta_data ->> 'division_id')),'')::uuid,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'districtId',new.raw_user_meta_data ->> 'district_id')),'')::uuid,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'upazilaId',new.raw_user_meta_data ->> 'upazila_id')),'')::uuid,
    case when lower(coalesce(new.raw_user_meta_data ->> 'termsAccepted','')) in ('true','1','yes') then now() else null end,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'bloodGroup',new.raw_user_meta_data ->> 'blood_group')),''),
    nullif(btrim(new.raw_user_meta_data ->> 'gender'),''),
    case when v_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then v_date::date else null end)
  on conflict (id) do nothing;
  perform set_config('app.profile_bootstrap','false',true);
  return new;
exception when unique_violation then
  perform set_config('app.profile_bootstrap','true',true);
  v_username := left(v_base,9) || '_' || substr(md5(new.id::text || clock_timestamp()::text),1,14);
  insert into public.profiles (id,username,full_name,email,role,status,email_verified)
  values (new.id,v_username,v_full_name,v_email,v_role,'active',new.email_confirmed_at is not null)
  on conflict (id) do nothing;
  perform set_config('app.profile_bootstrap','false',true);
  return new;
end;
$$;
create or replace function public.sync_auth_email_verified()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.email_confirmed_at is distinct from old.email_confirmed_at and new.email_confirmed_at is not null then
    perform set_config('app.profile_bootstrap','true',true);
    update public.profiles set email_verified=true,
      role=case when lower(coalesce(new.email,''))='rajiurrahman21@gmail.com' then 'admin' else role end,
      updated_at=now() where id=new.id;
    perform set_config('app.profile_bootstrap','false',true);
  end if;
  return new;
end;
$$;
revoke all on function public.handle_new_auth_user() from public,anon,authenticated;
revoke all on function public.sync_auth_email_verified() from public,anon,authenticated;
