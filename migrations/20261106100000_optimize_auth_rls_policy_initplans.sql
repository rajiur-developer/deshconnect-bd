do $$
declare
  p record;
  v_roles text;
  v_using text;
  v_check text;
  v_sql text;
begin
  for p in
    select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    from pg_policies
    where schemaname = 'public'
      and (tablename, policyname) in (
        ('blood_donors','blood_donors_self_insert'),
        ('blood_donors','blood_donors_self_read'),
        ('blood_donors','blood_donors_self_update'),
        ('blood_requests','blood_requests_self_insert'),
        ('blood_requests','blood_requests_self_read'),
        ('blood_requests','blood_requests_self_update'),
        ('connections','connections_addressee_respond'),
        ('connections','connections_participant_read'),
        ('connections','connections_requester_cancel'),
        ('connections','connections_requester_insert'),
        ('conversations','conversations_insert_allowed'),
        ('conversations','conversations_participant_read'),
        ('messages','messages_insert_auth'),
        ('messages','messages_read_own'),
        ('messages','messages_sender_delete_own'),
        ('messages','messages_sender_edit_own')
      )
  loop
    v_roles := array_to_string(p.roles, ', ');
    v_using := case when p.qual is null then '' else
      ' using (' || replace(replace(p.qual, 'auth.uid()', '(select auth.uid())'), 'auth.jwt()', '(select auth.jwt())') || ')' end;
    v_check := case when p.with_check is null then '' else
      ' with check (' || replace(replace(p.with_check, 'auth.uid()', '(select auth.uid())'), 'auth.jwt()', '(select auth.jwt())') || ')' end;
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    v_sql := format('create policy %I on %I.%I as %s for %s to %s%s%s',
      p.policyname, p.schemaname, p.tablename, p.permissive, p.cmd, v_roles, v_using, v_check);
    execute v_sql;
  end loop;
end;
$$;
