-- Tighten execute privileges for SECURITY DEFINER functions exposed through PostgREST.
revoke execute on function public.delete_expired_blood_requests() from public, anon, authenticated;
revoke execute on function public.notify_donors_on_blood_request() from public, anon, authenticated;

revoke execute on function public.get_unread_message_counts() from public, anon;
grant execute on function public.get_unread_message_counts() to authenticated;

revoke execute on function public.hide_chat_message_for_current_user(uuid) from public, anon;
grant execute on function public.hide_chat_message_for_current_user(uuid) to authenticated;

revoke execute on function public.is_current_user_admin() from public, anon;
grant execute on function public.is_current_user_admin() to authenticated;

revoke execute on function public.is_current_user_staff() from public, anon;
grant execute on function public.is_current_user_staff() to authenticated;

revoke execute on function public.mark_conversation_messages_delivered(uuid) from public, anon;
grant execute on function public.mark_conversation_messages_delivered(uuid) to authenticated;

revoke execute on function public.mark_conversation_messages_read(uuid) from public, anon;
grant execute on function public.mark_conversation_messages_read(uuid) to authenticated;

revoke execute on function public.toggle_message_reaction(uuid, text) from public, anon;
grant execute on function public.toggle_message_reaction(uuid, text) to authenticated;
