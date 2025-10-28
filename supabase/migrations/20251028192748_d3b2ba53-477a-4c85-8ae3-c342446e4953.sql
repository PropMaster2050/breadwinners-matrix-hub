-- Fix the handle_new_user function to avoid ON CONFLICT errors
-- by removing ON CONFLICT clauses that don't have matching unique constraints

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
  -- Insert profile (no ON CONFLICT since user_id is unique)
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
  );

  -- Create wallet (no ON CONFLICT since user_id is unique)
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);

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

  -- Insert into network tree (no ON CONFLICT since user_id is unique)
  INSERT INTO public.network_tree (user_id, parent_id)
  VALUES (NEW.id, parent_user_id);

  -- Stage 1 commission on join goes to direct upline
  IF parent_user_id IS NOT NULL THEN
    -- Check if commission already exists to avoid duplicates
    IF NOT EXISTS (
      SELECT 1 FROM public.commissions 
      WHERE upline_user_id = parent_user_id 
        AND recruit_user_id = NEW.id 
        AND stage_number = 1
    ) THEN
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
      );

      -- Credit upline wallet
      UPDATE public.wallets
      SET 
        e_wallet_balance = e_wallet_balance + commission_amount,
        total_earned = total_earned + commission_amount
      WHERE user_id = parent_user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;