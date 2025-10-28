-- Create stage_completions table to track when users complete each stage
CREATE TABLE IF NOT EXISTS public.stage_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_number integer NOT NULL CHECK (stage_number >= 1 AND stage_number <= 6),
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  recruits_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, stage_number)
);

-- Create commissions table to track all commission payments
CREATE TABLE IF NOT EXISTS public.commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  upline_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recruit_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_number integer NOT NULL CHECK (stage_number >= 1 AND stage_number <= 6),
  amount numeric NOT NULL,
  paid boolean NOT NULL DEFAULT false,
  paid_at timestamp with time zone,
  transaction_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(upline_user_id, recruit_user_id, stage_number)
);

-- Add avatar_url to profiles for visual representation
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Add current_stage to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_stage integer NOT NULL DEFAULT 1 CHECK (current_stage >= 1 AND current_stage <= 6);

-- Enable RLS
ALTER TABLE public.stage_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stage_completions
CREATE POLICY "Users can view own stage completions"
ON public.stage_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view network stage completions"
ON public.stage_completions FOR SELECT
USING (is_in_user_branch(user_id, auth.uid()));

CREATE POLICY "Admins can manage all stage completions"
ON public.stage_completions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert stage completions"
ON public.stage_completions FOR INSERT
WITH CHECK (true);

-- RLS Policies for commissions
CREATE POLICY "Users can view own commissions received"
ON public.commissions FOR SELECT
USING (auth.uid() = upline_user_id);

CREATE POLICY "Users can view commissions from their network"
ON public.commissions FOR SELECT
USING (is_in_user_branch(recruit_user_id, auth.uid()));

CREATE POLICY "Admins can manage all commissions"
ON public.commissions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert commissions"
ON public.commissions FOR INSERT
WITH CHECK (true);

-- Function to calculate and award commissions when a stage is completed
CREATE OR REPLACE FUNCTION public.process_stage_completion(
  _user_id uuid,
  _stage_number integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _upline_user_id uuid;
  _commission_amount numeric;
  _result jsonb;
BEGIN
  -- Get commission amount for this stage
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

  -- Insert stage completion record
  INSERT INTO public.stage_completions (user_id, stage_number, recruits_count)
  VALUES (_user_id, _stage_number, 0)
  ON CONFLICT (user_id, stage_number) DO NOTHING;

  -- Update user's current stage
  UPDATE public.profiles
  SET current_stage = _stage_number
  WHERE user_id = _user_id;

  -- If user has upline, create commission record
  IF _upline_user_id IS NOT NULL THEN
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

    -- Add to upline's e_wallet
    UPDATE public.wallets
    SET 
      e_wallet_balance = e_wallet_balance + _commission_amount,
      total_earned = total_earned + _commission_amount
    WHERE user_id = _upline_user_id;
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.process_stage_completion(uuid, integer) TO authenticated, anon;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stage_completions_user_id ON public.stage_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_stage_completions_stage_number ON public.stage_completions(stage_number);
CREATE INDEX IF NOT EXISTS idx_commissions_upline_user_id ON public.commissions(upline_user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_recruit_user_id ON public.commissions(recruit_user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_stage_number ON public.commissions(stage_number);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.stage_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commissions;