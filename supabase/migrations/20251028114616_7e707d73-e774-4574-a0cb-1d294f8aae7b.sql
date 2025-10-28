-- 1) Create SECURITY DEFINER functions to avoid RLS recursion
create or replace function public.downline_user_ids(viewer_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  with recursive downline as (
    select nt.user_id
    from public.network_tree nt
    where nt.parent_id = viewer_id
    union all
    select child.user_id
    from public.network_tree child
    join downline d on child.parent_id = d.user_id
  )
  select user_id from downline
$$;

create or replace function public.is_in_user_branch(target_user_id uuid, viewer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    target_user_id = viewer_id
    or exists (
      select 1
      from public.network_tree nt
      where nt.user_id = target_user_id
        and (
          nt.parent_id = viewer_id
          or nt.user_id in (select * from public.downline_user_ids(viewer_id))
        )
    )
$$;

-- 2) Replace recursive RLS policies with safe function-based ones
-- Drop problematic policies
drop policy if exists "Users can view own network branch" on public.network_tree;
drop policy if exists "Users can view network profiles" on public.profiles;

-- Recreate policies using SECURITY DEFINER functions
create policy "Users can view own network branch (definer)"
on public.network_tree
for select
to authenticated
using (
  user_id = auth.uid()
  or parent_id = auth.uid()
  or public.is_in_user_branch(user_id, auth.uid())
);

create policy "Users can view network profiles (definer)"
on public.profiles
for select
to authenticated
using (
  auth.uid() = user_id
  or public.is_in_user_branch(profiles.user_id, auth.uid())
);
