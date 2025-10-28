-- Ensure unique commission per (upline, recruit, stage)
CREATE UNIQUE INDEX IF NOT EXISTS commissions_unique_upline_recruit_stage
ON public.commissions (upline_user_id, recruit_user_id, stage_number);

-- Update handle_new_user to link parent via parent_id or referrer_code and award Stage 1 commission
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  parent_user_id uuid;
  commission_amount numeric := 100;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (
    user_id,
    full_name,
    username,
    email,
    phone,
    id_number,
    own_referral_code,
    referrer_code
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'id_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'own_referral_code', ''),
    NEW.raw_user_meta_data->>'referrer_code'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create wallet
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Resolve parent: prefer explicit parent_id, fallback to referrer_code lookup
  SELECT COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'parent_id','')::uuid,
    (
      SELECT p.user_id
      FROM public.profiles p
      WHERE lower(p.own_referral_code) = lower(NEW.raw_user_meta_data->>'referrer_code')
      LIMIT 1
    )
  ) INTO parent_user_id;

  -- Insert into network tree
  INSERT INTO public.network_tree (user_id, parent_id)
  VALUES (NEW.id, parent_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Stage 1 commission on join goes to direct upline
  IF parent_user_id IS NOT NULL THEN
    INSERT INTO public.commissions (
      upline_user_id,
      recruit_user_id,
      stage_number,
      amount
    )
    VALUES (
      parent_user_id,
      NEW.id,
      1,
      commission_amount
    )
    ON CONFLICT (upline_user_id, recruit_user_id, stage_number) DO NOTHING;

    -- Credit upline wallet
    UPDATE public.wallets
    SET 
      e_wallet_balance = e_wallet_balance + commission_amount,
      total_earned = total_earned + commission_amount
    WHERE user_id = parent_user_id;
  END IF;

  RETURN NEW;
END;
$function$;