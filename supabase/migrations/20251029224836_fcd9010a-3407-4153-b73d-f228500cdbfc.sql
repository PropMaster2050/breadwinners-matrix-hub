-- Fix stage progression and commission structure for all 6 stages
-- This ensures proper stage locking and correct payment amounts

CREATE OR REPLACE FUNCTION public.process_stage_completion(_user_id uuid, _stage_number integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _upline_user_id uuid;
  _commission_amount numeric;
  _direct_recruits_count integer;
  _completed_stage_count integer;
  _upline_current_stage integer;
  _result jsonb;
BEGIN
  -- Define commission amounts based on which stage was completed
  _commission_amount := CASE _stage_number
    WHEN 1 THEN 200   -- Upline gets R200 when recruit completes Stage 1
    WHEN 2 THEN 250   -- Upline gets R250 when recruit completes Stage 2
    WHEN 3 THEN 1000  -- Upline gets R1000 when recruit completes Stage 3
    WHEN 4 THEN 1500  -- Upline gets R1500 when recruit completes Stage 4
    WHEN 5 THEN 2000  -- Upline gets R2000 when recruit completes Stage 5
    ELSE 0
  END;

  -- Get upline (parent) from network_tree
  SELECT parent_id INTO _upline_user_id
  FROM public.network_tree
  WHERE user_id = _user_id
  LIMIT 1;

  -- Mark stage as completed for this user
  INSERT INTO public.stage_completions (user_id, stage_number, recruits_count)
  VALUES (_user_id, _stage_number, 0)
  ON CONFLICT (user_id, stage_number) 
  DO UPDATE SET completed_at = now();

  -- Update user's current stage if needed (don't go backwards)
  UPDATE public.profiles
  SET current_stage = GREATEST(current_stage, _stage_number + 1)
  WHERE user_id = _user_id;

  -- Pay commission to upline if they exist and are in the required stage
  IF _upline_user_id IS NOT NULL AND _stage_number < 6 THEN
    -- Get upline's current stage
    SELECT current_stage INTO _upline_current_stage
    FROM public.profiles
    WHERE user_id = _upline_user_id;

    -- Pay commission only if upline is in the next stage or higher
    IF _upline_current_stage >= (_stage_number + 1) THEN
      -- Create commission record
      INSERT INTO public.commissions (
        upline_user_id,
        recruit_user_id,
        stage_number,
        amount
      )
      VALUES (
        _upline_user_id,
        _user_id,
        _stage_number + 1,  -- Commission is for the upline's stage
        _commission_amount
      )
      ON CONFLICT (upline_user_id, recruit_user_id, stage_number) DO NOTHING;

      -- Credit upline's wallet instantly
      UPDATE public.wallets
      SET 
        e_wallet_balance = e_wallet_balance + _commission_amount,
        total_earned = total_earned + _commission_amount
      WHERE user_id = _upline_user_id;
    END IF;

    -- Check if all 6 direct recruits completed this stage (to unlock next stage for upline)
    SELECT COUNT(*) INTO _direct_recruits_count
    FROM public.network_tree
    WHERE parent_id = _upline_user_id;

    -- Count how many of upline's direct recruits completed this stage
    SELECT COUNT(*) INTO _completed_stage_count
    FROM public.network_tree nt
    JOIN public.stage_completions sc ON sc.user_id = nt.user_id
    WHERE nt.parent_id = _upline_user_id
      AND sc.stage_number = _stage_number;

    -- If all 6 direct recruits completed this stage, unlock next stage for upline
    IF _direct_recruits_count >= 6 AND _completed_stage_count >= 6 THEN
      -- Mark upline's current stage as completed
      INSERT INTO public.stage_completions (user_id, stage_number, recruits_count, completed_at)
      VALUES (_upline_user_id, _stage_number + 1, 6, now())
      ON CONFLICT (user_id, stage_number) DO NOTHING;

      -- Unlock next stage for upline (move them forward)
      UPDATE public.profiles
      SET current_stage = GREATEST(current_stage, _stage_number + 2)
      WHERE user_id = _upline_user_id;
    END IF;
  END IF;

  _result := jsonb_build_object(
    'success', true,
    'stage', _stage_number,
    'commission_amount', _commission_amount,
    'upline_user_id', _upline_user_id
  );

  RETURN _result;
END;
$$;