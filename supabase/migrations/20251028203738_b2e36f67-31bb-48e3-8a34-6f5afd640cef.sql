-- Enable real-time updates for wallets table
ALTER TABLE public.wallets REPLICA IDENTITY FULL;

-- Add wallets to realtime publication if not already added
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'wallets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
  END IF;
END $$;