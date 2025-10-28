-- Fix RLS for profiles so admins can view all users
-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view network profiles" ON public.profiles;

-- Create PERMISSIVE SELECT policies (default is permissive, so no AS keyword needed)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view network profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.network_tree nt
    WHERE nt.user_id = profiles.user_id
      AND (
        nt.parent_id = auth.uid() OR
        nt.user_id IN (
          WITH RECURSIVE downline AS (
            SELECT nt1.user_id
            FROM public.network_tree nt1
            WHERE nt1.parent_id = auth.uid()
            UNION ALL
            SELECT nt2.user_id
            FROM public.network_tree nt2
            JOIN downline d ON nt2.parent_id = d.user_id
          )
          SELECT user_id FROM downline
        )
      )
  )
);

-- Ensure admins can update/insert profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));