-- Drop and recreate the handle_new_user function to award commissions to all uplines
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
  current_upline_id uuid;
  upline_level integer := 0;
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

  -- Award Stage 1 commission to ALL uplines in the tree (not just direct parent)
  IF parent_user_id IS NOT NULL THEN
    current_upline_id := parent_user_id;
    
    -- Traverse up the entire upline tree
    WHILE current_upline_id IS NOT NULL LOOP
      upline_level := upline_level + 1;
      
      -- Check if commission already exists for this upline
      IF NOT EXISTS (
        SELECT 1 FROM public.commissions 
        WHERE upline_user_id = current_upline_id 
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
          current_upline_id,
          NEW.id,
          1,
          commission_amount
        );

        -- Credit upline wallet immediately
        UPDATE public.wallets
        SET 
          e_wallet_balance = e_wallet_balance + commission_amount,
          total_earned = total_earned + commission_amount
        WHERE user_id = current_upline_id;
      END IF;

      -- If this is the direct parent, update their recruit count
      IF upline_level = 1 THEN
        -- Update direct parent's recruit count
        UPDATE public.profiles
        SET direct_recruits = direct_recruits + 1
        WHERE user_id = current_upline_id;

        -- Check if direct parent completed Stage 1 (6 recruits)
        IF (SELECT direct_recruits FROM public.profiles WHERE user_id = current_upline_id) >= 6 THEN
          -- Mark Stage 1 as completed
          INSERT INTO public.stage_completions (user_id, stage_number, recruits_count, completed_at)
          VALUES (current_upline_id, 1, 6, now())
          ON CONFLICT (user_id, stage_number) DO NOTHING;

          -- Unlock Stage 2 for direct parent
          UPDATE public.profiles
          SET current_stage = GREATEST(current_stage, 2)
          WHERE user_id = current_upline_id;
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