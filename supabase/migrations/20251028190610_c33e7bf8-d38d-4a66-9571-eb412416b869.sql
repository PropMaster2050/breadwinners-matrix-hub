-- Create trigger to call public.handle_new_user after a user signs up
-- Drop if exists, then recreate to ensure it's properly attached

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();