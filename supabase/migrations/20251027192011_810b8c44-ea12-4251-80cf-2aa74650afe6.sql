-- Function to promote a user to admin by email
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Get user id from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Grant execute permission to authenticated users (they can only promote themselves if they know the function)
GRANT EXECUTE ON FUNCTION public.promote_user_to_admin(text) TO authenticated;

COMMENT ON FUNCTION public.promote_user_to_admin IS 'Promotes a user to admin role by email. Should be called manually for the first admin setup.';