-- Ensure trigger exists to run handle_new_user() on signup
-- This awards Stage 1 commissions and initializes profile/wallet/network
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();