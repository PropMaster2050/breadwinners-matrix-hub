-- Set registration wallet default to R0 for new users
ALTER TABLE public.wallets
ALTER COLUMN registration_wallet_balance SET DEFAULT 0;

-- Reset existing accounts that still have the old default but no earnings yet
UPDATE public.wallets
SET registration_wallet_balance = 0,
    updated_at = now()
WHERE registration_wallet_balance = 250
  AND COALESCE(total_earned, 0) = 0
  AND COALESCE(e_wallet_balance, 0) = 0;