-- Fix the network and commission system for 6-person stages

-- 1. Add logging table to track registration issues
CREATE TABLE IF NOT EXISTS public.registration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  referrer_code text,
  parent_found boolean,
  parent_id uuid,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Update handle_new_user to properly resolve referrals and log issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  parent_user_id uuid;
  commission_amount numeric := 100;
  referrer_code_input text;
BEGIN
  referrer_code_input := COALESCE(NEW.raw_user_meta_data->>'referrer_code', '');

  -- Insert profile first
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
    referrer_code_input
  );

  -- Create wallet
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);

  -- Resolve parent from referrer_code (case-insensitive, trimmed)
  IF referrer_code_input != '' THEN
    SELECT p.user_id INTO parent_user_id
    FROM public.profiles p
    WHERE LOWER(TRIM(p.own_referral_code)) = LOWER(TRIM(referrer_code_input))
    LIMIT 1;

    -- Log the referral attempt
    INSERT INTO public.registration_logs (
      user_id,
      referrer_code,
      parent_found,
      parent_id,
      error_message
    ) VALUES (
      NEW.id,
      referrer_code_input,
      parent_user_id IS NOT NULL,
      parent_user_id,
      CASE WHEN parent_user_id IS NULL THEN 'Referrer code not found' ELSE NULL END
    );
  END IF;

  -- Insert into network tree
  INSERT INTO public.network_tree (user_id, parent_id)
  VALUES (NEW.id, parent_user_id);

  -- Award Stage 1 commission to direct upline (R100)
  IF parent_user_id IS NOT NULL THEN
    -- Check if commission already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.commissions 
      WHERE upline_user_id = parent_user_id 
        AND recruit_user_id = NEW.id 
        AND stage_number = 1
    ) THEN
      -- Create commission record
      INSERT INTO public.commissions (
        upline_user_id,
        recruit_user_id,
        stage_number,
        amount
      ) VALUES (
        parent_user_id,
        NEW.id,
        1,
        commission_amount
      );

      -- Credit upline wallet immediately
      UPDATE public.wallets
      SET 
        e_wallet_balance = e_wallet_balance + commission_amount,
        total_earned = total_earned + commission_amount
      WHERE user_id = parent_user_id;

      -- Update upline's direct recruit count
      UPDATE public.profiles
      SET direct_recruits = direct_recruits + 1
      WHERE user_id = parent_user_id;

      -- Check if upline completed Stage 1 (6 recruits)
      IF (SELECT direct_recruits FROM public.profiles WHERE user_id = parent_user_id) >= 6 THEN
        -- Mark Stage 1 as completed
        INSERT INTO public.stage_completions (user_id, stage_number, recruits_count, completed_at)
        VALUES (parent_user_id, 1, 6, now())
        ON CONFLICT (user_id, stage_number) DO NOTHING;

        -- Unlock Stage 2 for upline
        UPDATE public.profiles
        SET current_stage = GREATEST(current_stage, 2)
        WHERE user_id = parent_user_id;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;