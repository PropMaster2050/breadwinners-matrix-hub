-- Update process_stage_completion to handle all stages with correct commission amounts
CREATE OR REPLACE FUNCTION public.process_stage_completion(_user_id uuid, _stage_number integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _upline_user_id uuid;
  _commission_amount numeric;
  _all_recruits_completed boolean;
  _direct_recruits_count integer;
  _completed_previous_stage_count integer;
  _result jsonb;
  _grand_prize numeric := 12000;
BEGIN
  -- Get commission amount for this stage (upline gets this when recruit completes previous stage)
  _commission_amount := CASE _stage_number
    WHEN 1 THEN 100
    WHEN 2 THEN 200
    WHEN 3 THEN 250
    WHEN 4 THEN 1000
    WHEN 5 THEN 1500
    WHEN 6 THEN 2000
    ELSE 0
  END;

  -- Get upline (parent) from network_tree
  SELECT parent_id INTO _upline_user_id
  FROM public.network_tree
  WHERE user_id = _user_id
  LIMIT 1;

  -- Insert or update stage completion record
  INSERT INTO public.stage_completions (user_id, stage_number, recruits_count)
  VALUES (_user_id, _stage_number, 0)
  ON CONFLICT (user_id, stage_number) 
  DO UPDATE SET completed_at = now();

  -- Update user's current stage (always move forward)
  UPDATE public.profiles
  SET current_stage = GREATEST(current_stage, _stage_number + 1)
  WHERE user_id = _user_id;

  -- If user has upline and this is not Stage 1, create commission for completing previous stage
  IF _upline_user_id IS NOT NULL AND _stage_number > 1 THEN
    -- Create commission record for upline (they earn when recruit completes previous stage)
    INSERT INTO public.commissions (
      upline_user_id,
      recruit_user_id,
      stage_number,
      amount
    )
    VALUES (
      _upline_user_id,
      _user_id,
      _stage_number,
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

  -- Check if upline's all direct recruits completed this stage (to unlock next stage for upline)
  IF _upline_user_id IS NOT NULL THEN
    -- Count upline's direct recruits
    SELECT COUNT(*) INTO _direct_recruits_count
    FROM public.network_tree
    WHERE parent_id = _upline_user_id;

    -- Count how many of upline's recruits completed this stage
    SELECT COUNT(*) INTO _completed_previous_stage_count
    FROM public.network_tree nt
    JOIN public.stage_completions sc ON sc.user_id = nt.user_id
    WHERE nt.parent_id = _upline_user_id
      AND sc.stage_number = _stage_number;

    -- If all 6 direct recruits completed this stage, unlock next stage for upline
    IF _direct_recruits_count >= 6 AND _completed_previous_stage_count >= 6 THEN
      _all_recruits_completed := true;
      
      -- Unlock next stage for upline
      UPDATE public.profiles
      SET current_stage = GREATEST(current_stage, _stage_number + 1)
      WHERE user_id = _upline_user_id;

      -- If this was Stage 5 completion (all 6 completed), award grand prize for Stage 6
      IF _stage_number = 5 THEN
        UPDATE public.wallets
        SET 
          e_wallet_balance = e_wallet_balance + _grand_prize,
          total_earned = total_earned + _grand_prize
        WHERE user_id = _upline_user_id;

        -- Record grand prize commission
        INSERT INTO public.commissions (
          upline_user_id,
          recruit_user_id,
          stage_number,
          amount
        )
        VALUES (
          _upline_user_id,
          _user_id,
          6,
          _grand_prize / 6  -- Split record across recruits for tracking
        )
        ON CONFLICT DO NOTHING;
      END IF;
    ELSE
      _all_recruits_completed := false;
    END IF;
  END IF;

  _result := jsonb_build_object(
    'success', true,
    'stage', _stage_number,
    'commission_amount', _commission_amount,
    'upline_user_id', _upline_user_id,
    'all_recruits_completed', COALESCE(_all_recruits_completed, false)
  );

  RETURN _result;
END;
$$;