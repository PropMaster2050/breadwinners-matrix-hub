-- ==========================================
-- SECURITY FIX MIGRATION
-- ==========================================

-- 1. CREATE PROFILE AUTO-CREATION TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  );

  -- Create wallet
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);

  -- Insert into network tree
  INSERT INTO public.network_tree (user_id, parent_id)
  VALUES (NEW.id, (NEW.raw_user_meta_data->>'parent_id')::uuid);

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. FIX PROFILES TABLE RLS - REMOVE PUBLIC ACCESS
-- ==========================================
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Users can only view their own profile and profiles in their network
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can view profiles in their network (for network tree display)
CREATE POLICY "Users can view network profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.network_tree nt
    WHERE nt.user_id = profiles.user_id
    AND (
      nt.parent_id = auth.uid() 
      OR nt.user_id IN (
        SELECT user_id FROM public.network_tree WHERE parent_id = auth.uid()
      )
    )
  )
);

-- 3. FIX NETWORK TREE RLS - RESTRICT TO OWN NETWORK
-- ==========================================
DROP POLICY IF EXISTS "Users can view all network tree" ON public.network_tree;

-- Users can view their own network branch
CREATE POLICY "Users can view own network branch"
ON public.network_tree
FOR SELECT
USING (
  user_id = auth.uid() 
  OR parent_id = auth.uid()
  OR user_id IN (
    WITH RECURSIVE downline AS (
      SELECT user_id FROM public.network_tree WHERE parent_id = auth.uid()
      UNION
      SELECT nt.user_id FROM public.network_tree nt
      INNER JOIN downline d ON nt.parent_id = d.user_id
    )
    SELECT user_id FROM downline
  )
);

-- 4. SECURE WALLET OPERATIONS WITH FUNCTIONS
-- ==========================================

-- Function to deduct from wallet (with validation)
CREATE OR REPLACE FUNCTION public.deduct_from_wallet(
  _user_id uuid,
  _amount numeric,
  _wallet_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance numeric;
BEGIN
  -- Verify caller is the wallet owner
  IF auth.uid() != _user_id THEN
    RAISE EXCEPTION 'Unauthorized wallet access';
  END IF;

  -- Validate amount
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Get current balance based on wallet type
  SELECT 
    CASE 
      WHEN _wallet_type = 'e_wallet' THEN e_wallet_balance
      WHEN _wallet_type = 'registration_wallet' THEN registration_wallet_balance
      WHEN _wallet_type = 'incentive_wallet' THEN incentive_wallet_balance
      ELSE 0
    END INTO current_balance
  FROM public.wallets
  WHERE user_id = _user_id;

  -- Check sufficient balance
  IF current_balance < _amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Deduct amount
  IF _wallet_type = 'e_wallet' THEN
    UPDATE public.wallets 
    SET e_wallet_balance = e_wallet_balance - _amount,
        total_withdrawn = total_withdrawn + _amount
    WHERE user_id = _user_id;
  ELSIF _wallet_type = 'registration_wallet' THEN
    UPDATE public.wallets 
    SET registration_wallet_balance = registration_wallet_balance - _amount
    WHERE user_id = _user_id;
  ELSIF _wallet_type = 'incentive_wallet' THEN
    UPDATE public.wallets 
    SET incentive_wallet_balance = incentive_wallet_balance - _amount
    WHERE user_id = _user_id;
  END IF;

  RETURN true;
END;
$$;

-- Function to add to wallet (admin or system only)
CREATE OR REPLACE FUNCTION public.add_to_wallet(
  _user_id uuid,
  _amount numeric,
  _wallet_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can add to wallets
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Validate amount
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Add amount
  IF _wallet_type = 'e_wallet' THEN
    UPDATE public.wallets 
    SET e_wallet_balance = e_wallet_balance + _amount,
        total_earned = total_earned + _amount
    WHERE user_id = _user_id;
  ELSIF _wallet_type = 'registration_wallet' THEN
    UPDATE public.wallets 
    SET registration_wallet_balance = registration_wallet_balance + _amount
    WHERE user_id = _user_id;
  ELSIF _wallet_type = 'incentive_wallet' THEN
    UPDATE public.wallets 
    SET incentive_wallet_balance = incentive_wallet_balance + _amount,
        total_earned = total_earned + _amount
    WHERE user_id = _user_id;
  END IF;

  RETURN true;
END;
$$;