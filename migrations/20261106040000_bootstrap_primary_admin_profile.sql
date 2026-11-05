-- Create a profile for each new Supabase Auth user.
-- Only the verified owner of this exact email receives the initial admin role.
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
  insert into public.profiles (id,username,full_name,email,role,status,email_verified,phone,division_id,district_id,upazila_id,terms_accepted_at,blood_group,gender,date_of_birth)
  values (new.id,left(v_username,24),v_full_name,v_email,v_role,'active',new.email_confirmed_at is not null,
    nullif(btrim(new.raw_user_meta_data ->> 'phone'),''),
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'divisionId',new.raw_user_meta_data ->> 'division_id')),'')::uuid,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'districtId',new.raw_user_meta_data ->> 'district_id')),'')::uuid,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'upazilaId',new.raw_user_meta_data ->> 'upazila_id')),'')::uuid,
    case when lower(coalesce(new.raw_user_meta_data ->> 'termsAccepted','')) in ('true','1','yes') then now() else null end,
    nullif(btrim(coalesce(new.raw_user_meta_data ->> 'bloodGroup',new.raw_user_meta_data ->> 'blood_group')),''),
    nullif(btrim(new.raw_user_meta_data ->> 'gender'),''),
    case when v_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then v_date::date else null end);
  return new;
exception when unique_violation then
  v_username := left(v_base,17) || '_' || right(replace(new.id::text,'-',''),6);
  insert into public.profiles (id,username,full_name,email,role,status,email_verified)
  values (new.id,left(v_username,24),v_full_name,v_email,v_role,'active',new.email_confirmed_at is not null);
  return new;
end;
$$;
revoke all on function public.handle_new_auth_user() from public,anon,authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user();

create or replace function public.sync_auth_email_verified()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.email_confirmed_at is distinct from old.email_confirmed_at and new.email_confirmed_at is not null then
    update public.profiles set email_verified=true,updated_at=now() where id=new.id;
  end if;
  return new;
end;
$$;
revoke all on function public.sync_auth_email_verified() from public,anon,authenticated;
drop trigger if exists on_auth_user_email_verified on auth.users;
create trigger on_auth_user_email_verified after update of email_confirmed_at on auth.users for each row execute function public.sync_auth_email_verified();
