-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    id_number TEXT NOT NULL,
    referrer_code TEXT,
    own_referral_code TEXT NOT NULL UNIQUE,
    direct_recruits INTEGER NOT NULL DEFAULT 0,
    total_recruits INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (CRITICAL: separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create bank_accounts table
CREATE TABLE public.bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    account_number TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_holder TEXT NOT NULL,
    account_type TEXT NOT NULL,
    branch_code TEXT NOT NULL,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    account_order INTEGER NOT NULL CHECK (account_order IN (1, 2, 3)),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, account_order)
);

-- Create withdrawals table
CREATE TABLE public.withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    bank_account_id UUID NOT NULL REFERENCES public.bank_accounts(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallets table
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    e_wallet_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    incentive_wallet_balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    registration_wallet_balance DECIMAL(10, 2) NOT NULL DEFAULT 250,
    total_earned DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_withdrawn DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create network_tree table for tracking referral structure
CREATE TABLE public.network_tree (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    parent_id UUID,
    level INTEGER NOT NULL DEFAULT 1,
    stage INTEGER NOT NULL DEFAULT 1 CHECK (stage IN (1, 2, 3, 4)),
    position_in_matrix INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_tree ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for profiles table
CREATE POLICY "Users can view all profiles"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can do everything on profiles"
    ON public.profiles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles table
CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bank_accounts table
CREATE POLICY "Users can view own bank accounts"
    ON public.bank_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts"
    ON public.bank_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id AND NOT is_locked);

CREATE POLICY "Users cannot update locked accounts"
    ON public.bank_accounts FOR UPDATE
    USING (auth.uid() = user_id AND NOT is_locked);

CREATE POLICY "Admins can view all bank accounts"
    ON public.bank_accounts FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for withdrawals table
CREATE POLICY "Users can view own withdrawals"
    ON public.withdrawals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawals"
    ON public.withdrawals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals"
    ON public.withdrawals FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all withdrawals"
    ON public.withdrawals FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for wallets table
CREATE POLICY "Users can view own wallet"
    ON public.wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
    ON public.wallets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet"
    ON public.wallets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all wallets"
    ON public.wallets FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for network_tree table
CREATE POLICY "Users can view all network tree"
    ON public.network_tree FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own network position"
    ON public.network_tree FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage network tree"
    ON public.network_tree FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at
    BEFORE UPDATE ON public.withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_referrer_code ON public.profiles(referrer_code);
CREATE INDEX idx_profiles_own_referral_code ON public.profiles(own_referral_code);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_bank_accounts_user_id ON public.bank_accounts(user_id);
CREATE INDEX idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX idx_network_tree_user_id ON public.network_tree(user_id);
CREATE INDEX idx_network_tree_parent_id ON public.network_tree(parent_id);