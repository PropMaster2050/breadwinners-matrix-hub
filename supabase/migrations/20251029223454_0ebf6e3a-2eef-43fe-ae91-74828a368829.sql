-- Fix commission spillover and stage progression; enable multi-account email via metadata
-- 1) Update RPC to resolve auth email (alias) for login
CREATE OR REPLACE FUNCTION public.get_email_for_login(identifier text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  select au.email
  from public.profiles p
  join auth.users au on au.id = p.user_id
  where lower(p.username) = lower(identifier)
     or lower(p.own_referral_code) = lower(identifier)
  limit 1;
$function$;

-- 2) Update handle_new_user to:
--    - store real_email from metadata when provided
--    - pay R100 Stage 1 only to uplines still in Stage 1 (current_stage = 1)
--    - when a user (direct parent) completes Stage 1 (6 directs), unlock Stage 2
--      and pay R200 Stage 2 commission to their direct upline IF that upline is in Stage 2+
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  parent_user_id uuid;
  commission_amount_stage1 numeric := 100;
  commission_amount_stage2 numeric := 200;
  referrer_code_input text;
  current_upline_id uuid;
  grandparent_id uuid;
  upline_level integer := 0;
  email_to_store text;
  upline_stage int;
  direct_parent_recruits int;
BEGIN
  referrer_code_input := COALESCE(NEW.raw_user_meta_data->>'referrer_code', '');
  email_to_store := COALESCE(NEW.raw_user_meta_data->>'real_email', NEW.email);

  -- Insert profile first using real email when provided
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
    email_to_store,
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

  -- Award Stage 1 commission ONLY to uplines who are still in Stage 1
  IF parent_user_id IS NOT NULL THEN
    current_upline_id := parent_user_id;
    WHILE current_upline_id IS NOT NULL LOOP
      upline_level := upline_level + 1;

      SELECT current_stage INTO upline_stage FROM public.profiles WHERE user_id = current_upline_id;

      IF upline_stage = 1 THEN
        -- Pay Stage 1 commission if not already paid for this recruit
        IF NOT EXISTS (
          SELECT 1 FROM public.commissions 
          WHERE upline_user_id = current_upline_id 
            AND recruit_user_id = NEW.id 
            AND stage_number = 1
        ) THEN
          INSERT INTO public.commissions (
            upline_user_id,
            recruit_user_id,
            stage_number,
            amount
          ) VALUES (
            current_upline_id,
            NEW.id,
            1,
            commission_amount_stage1
          );

          UPDATE public.wallets
          SET 
            e_wallet_balance = e_wallet_balance + commission_amount_stage1,
            total_earned = total_earned + commission_amount_stage1
          WHERE user_id = current_upline_id;
        END IF;
      END IF;

      -- If this is the direct parent, update their direct recruit count and handle Stage 1 completion
      IF upline_level = 1 THEN
        UPDATE public.profiles
        SET direct_recruits = direct_recruits + 1
        WHERE user_id = current_upline_id
        RETURNING direct_recruits INTO direct_parent_recruits;

        IF direct_parent_recruits >= 6 THEN
          -- Mark Stage 1 as completed (idempotent) and unlock Stage 2
          INSERT INTO public.stage_completions (user_id, stage_number, recruits_count, completed_at)
          VALUES (current_upline_id, 1, 6, now())
          ON CONFLICT (user_id, stage_number) DO NOTHING;

          UPDATE public.profiles
          SET current_stage = GREATEST(current_stage, 2)
          WHERE user_id = current_upline_id;

          -- Pay Stage 2 commission (R200) to the direct upline when someone under them completes Stage 1
          SELECT parent_id INTO grandparent_id
          FROM public.network_tree
          WHERE user_id = current_upline_id
          LIMIT 1;

          IF grandparent_id IS NOT NULL THEN
            SELECT current_stage INTO upline_stage FROM public.profiles WHERE user_id = grandparent_id;

            IF upline_stage >= 2 THEN
              -- Avoid duplicate Stage 2 commission for this event
              IF NOT EXISTS (
                SELECT 1 FROM public.commissions 
                WHERE upline_user_id = grandparent_id 
                  AND recruit_user_id = current_upline_id 
                  AND stage_number = 2
              ) THEN
                INSERT INTO public.commissions (
                  upline_user_id,
                  recruit_user_id,
                  stage_number,
                  amount
                ) VALUES (
                  grandparent_id,
                  current_upline_id,
                  2,
                  commission_amount_stage2
                );

                UPDATE public.wallets
                SET 
                  e_wallet_balance = e_wallet_balance + commission_amount_stage2,
                  total_earned = total_earned + commission_amount_stage2
                WHERE user_id = grandparent_id;
              END IF;
            END IF;
          END IF;
        END IF;
      END IF;

      -- Move to next upline in the tree
      SELECT parent_id INTO current_upline_id
      FROM public.network_tree
      WHERE user_id = current_upline_id
      LIMIT 1;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$function$;

-- 3) Ensure trigger exists on auth.users to call handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();