-- Update process_stage_completion function for new 2x3 matrix structure
CREATE OR REPLACE FUNCTION public.process_stage_completion(_user_id uuid, _stage_number integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _upline_user_id uuid;
  _commission_amount numeric;
  _direct_recruits_count integer;
  _completed_stage_count integer;
  _upline_current_stage integer;
  _required_completions integer;
  _result jsonb;
BEGIN
  -- Define commission amounts based on which stage was completed
  -- Upline gets paid when their downline completes a stage
  _commission_amount := CASE _stage_number
    WHEN 1 THEN 150   -- Stage 2 upline gets R150 when recruit completes Stage 1
    WHEN 2 THEN 180   -- Stage 3 upline gets R180 when recruit completes Stage 2
    WHEN 3 THEN 1000  -- Stage 4 upline gets R1000 when recruit completes Stage 3
    WHEN 4 THEN 1500  -- Stage 5 upline gets R1500 when recruit completes Stage 4
    WHEN 5 THEN 2000  -- Stage 6 upline gets R2000 when recruit completes Stage 5
    ELSE 0
  END;

  -- Required completions for stage progression
  _required_completions := CASE _stage_number
    WHEN 1 THEN 14  -- Need 14 to unlock Stage 3 (Stage 2 users need 14 completing Stage 1)
    WHEN 2 THEN 14  -- Need 14 to unlock Stage 4 (Stage 3 users need 14 completing Stage 2)
    WHEN 3 THEN 14  -- Need 14 to unlock Stage 5 (Stage 4 users need 14 completing Stage 3)
    WHEN 4 THEN 14  -- Need 14 to unlock Stage 6 (Stage 5 users need 14 completing Stage 4)
    WHEN 5 THEN 14  -- Need 14 to complete Stage 6 (Stage 6 users need 14 completing Stage 5)
    ELSE 6
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

    -- Count how many downlines completed this stage (for stages 2-6, need 14 completions)
    SELECT COUNT(DISTINCT nt.user_id) INTO _completed_stage_count
    FROM public.network_tree nt
    JOIN public.stage_completions sc ON sc.user_id = nt.user_id
    WHERE nt.user_id IN (
      -- Get all downlines recursively
      WITH RECURSIVE downline AS (
        SELECT user_id FROM public.network_tree WHERE parent_id = _upline_user_id
        UNION ALL
        SELECT nt2.user_id FROM public.network_tree nt2
        JOIN downline d ON nt2.parent_id = d.user_id
      )
      SELECT user_id FROM downline
    )
    AND sc.stage_number = _stage_number;

    -- If required number of downlines completed this stage, unlock next stage for upline
    IF _completed_stage_count >= _required_completions THEN
      -- Mark upline's current stage as completed
      INSERT INTO public.stage_completions (user_id, stage_number, recruits_count, completed_at)
      VALUES (_upline_user_id, _stage_number + 1, _required_completions, now())
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
    'upline_user_id', _upline_user_id,
    'required_completions', _required_completions
  );

  RETURN _result;
END;
$function$;