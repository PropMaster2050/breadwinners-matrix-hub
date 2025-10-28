-- Create a SECURITY DEFINER function to resolve email for login from username or BWN ID
-- This safely bypasses RLS for a very narrow, exact-match lookup.
create or replace function public.get_email_for_login(identifier text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email
  from public.profiles
  where lower(username) = lower(identifier)
     or lower(own_referral_code) = lower(identifier)
  limit 1;
$$;

-- Allow both anonymous and authenticated clients to call it (needed before login)
grant execute on function public.get_email_for_login(text) to anon, authenticated;