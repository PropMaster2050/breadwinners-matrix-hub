-- Link signup to backend logic and enable realtime for tree/commissions
-- 1) Trigger: run public.handle_new_user() after auth signups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- 2) Ensure realtime events deliver full row data
ALTER TABLE public.stage_completions REPLICA IDENTITY FULL;
ALTER TABLE public.commissions REPLICA IDENTITY FULL;
ALTER TABLE public.network_tree REPLICA IDENTITY FULL;

-- 3) Add tables to supabase_realtime publication (safe if already present)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stage_completions;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.commissions;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.network_tree;
  EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
