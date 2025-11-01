import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  memberId: string;
  fullName: string;
  username: string;
  mobile: string;
  email?: string;
  physicalAddress?: string;
  province?: string;
  age?: number;
  gender?: string;
  sponsorId?: string;
  uplineId?: string;
  uplineName?: string;
  level: number;
  stage: number;
  earnings: number;
  directRecruits: number;
  totalRecruits: number;
  isActive: boolean;
  joinDate: string;
  ownReferralCode?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branchCode: string;
  };
  wallets: {
    eWallet: number;
    registrationWallet: number;
    incentiveWallet: number;
  };
  transactionPin?: string;
  downlines?: Array<{
    memberId: string;
    fullName: string;
    joinDate: string;
    level: number;
    isActive: boolean;
  }>;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

interface RegisterData {
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
  transactionPin: string;
  confirmTransactionPin: string;
  mobile: string;
  email?: string;
  physicalAddress?: string;
  province?: string;
  age?: number;
  gender?: string;
  sponsorId?: string;
  epin: string;
  idNumber?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Safe fallback to avoid runtime crashes if Provider isn't mounted yet
    return {
      user: null,
      login: async () => false,
      register: async () => false,
      logout: () => {},
      resetPassword: async () => false,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true,
    } as AuthContextType;
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const hydrateUserFromSupabase = async (userId: string): Promise<User | null> => {
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Hydration timeout')), 10000)
      );

      const dataPromise = Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle(),
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('network_tree').select('*').eq('user_id', userId).maybeSingle(),
      ]);

      const [
        { data: roleData },
        { data: profileData },
        { data: walletData },
        { data: networkData }
      ] = await Promise.race([dataPromise, timeoutPromise]) as any;

      const admin = !!roleData;

      if (!profileData) {
        console.error('No profile data found for user:', userId);
        return null;
      }

      // Provide safe defaults for all fields to support older accounts
      const baseUser: User = {
        id: userId,
        memberId: profileData.own_referral_code || `BW${userId.slice(0, 6)}`,
        fullName: profileData.full_name || 'User',
        username: profileData.username || 'unknown',
        email: profileData.email || '',
        mobile: profileData.phone || '',
        sponsorId: profileData.referrer_code || undefined,
        level: networkData?.level || 1,
        stage: profileData.current_stage || networkData?.stage || 1,
        earnings: walletData?.total_earned || 0,
        directRecruits: profileData.direct_recruits || 0,
        totalRecruits: profileData.total_recruits || 0,
        isActive: true,
        joinDate: profileData.created_at || new Date().toISOString(),
        wallets: {
          eWallet: walletData?.e_wallet_balance || 0,
          registrationWallet: walletData?.registration_wallet_balance || 0,
          incentiveWallet: walletData?.incentive_wallet_balance || 0
        },
        uplineId: networkData?.parent_id || undefined,
        ownReferralCode: profileData.own_referral_code || `BW${userId.slice(0, 6)}`
      };

      setUser(baseUser);
      setIsAdmin(admin);
      localStorage.setItem('breadwinners_user', JSON.stringify(baseUser));
      return baseUser;
    } catch (e) {
      console.error('Failed to hydrate user:', e);
      // Return null but don't crash - allow user to try again
      return null;
    }
  };

  // Keep auth state in sync without forcing sign-out on refresh
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Defer any Supabase calls to avoid deadlocks
        setTimeout(() => {
          hydrateUserFromSupabase(session.user!.id).finally(() => setIsLoading(false));
        }, 0);
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
        localStorage.removeItem('breadwinners_user');
      }
    });

    // Initialize from existing session (if any)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setTimeout(() => {
          hydrateUserFromSupabase(session.user!.id).finally(() => setIsLoading(false));
        }, 0);
      } else {
        setIsLoading(false);
      }
    });

    // Real-time wallet updates - refresh user when wallet balance changes
    const walletChannel = supabase
      .channel('wallet-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wallets'
        },
        (payload) => {
          // Only refresh if it's the current user's wallet
          const currentUserId = localStorage.getItem('breadwinners_user');
          if (currentUserId) {
            const userData = JSON.parse(currentUserId);
            if (payload.new.user_id === userData.id) {
              hydrateUserFromSupabase(userData.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(walletChannel);
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Trim and clean inputs
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      
      let email: string;
      if (cleanUsername.includes('@')) {
        // Allow email login for all users
        email = cleanUsername;
      } else {
        // Resolve email using secure RPC (supports username or BWN ID, case-insensitive)
        const { data: resolvedEmail, error: rpcError } = await supabase
          .rpc('get_email_for_login', { identifier: cleanUsername });
        
        if (rpcError || !resolvedEmail) {
          toast({
            title: "Login failed",
            description: "Username or BWN ID not found. Please check your login details.",
            variant: "destructive"
          });
          return false;
        }
        email = resolvedEmail;
      }
      
      // Try Supabase authentication with cleaned password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: cleanPassword,
      });

      if (!error && data.user) {
        // Check if user has admin role (with timeout protection)
        let isUserAdmin = false;
        try {
          const { data: roleData } = await Promise.race([
            supabase.from('user_roles').select('role').eq('user_id', data.user.id).eq('role', 'admin').maybeSingle(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Role check timeout')), 5000))
          ]) as any;
          isUserAdmin = !!roleData;
        } catch (roleError) {
          console.error('Role check error:', roleError);
          // Continue with non-admin login if role check fails
        }

        // Hydrate user profile with timeout protection
        try {
          const hydrated = await hydrateUserFromSupabase(data.user.id);
          if (hydrated) {
            toast({ title: isUserAdmin ? "Welcome back, Administrator!" : `Welcome back, ${hydrated.fullName}!` });
            navigate(isUserAdmin ? '/admin' : '/dashboard');
            return true;
          }
        } catch (hydrateError) {
          console.error('Hydration error:', hydrateError);
        }

        // If hydration failed, sign out and show helpful error
        await supabase.auth.signOut();
        toast({
          title: "Login failed",
          description: "Could not load your profile. Your account may need to be set up. Please contact support.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    // Minimal, reliable flow to avoid hangs. We only validate E-PIN, create auth user, and exit.
    try {
      console.log('Registration started', { username: userData.username });
      
      // 1) Check if username already exists
      const cleanUsername = userData.username.trim();
      const { data: existingUser, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (usernameCheckError) {
        console.error('Username check error:', usernameCheckError);
      }

      if (existingUser) {
        toast({ 
          title: 'Username already taken', 
          description: 'This username is already registered. Please choose a different username.', 
          variant: 'destructive' 
        });
        return false;
      }

      // 2) Validate E-PIN exists (read-only). Use maybeSingle to avoid throwing.
      const epinCode = (userData.epin || '').trim().toUpperCase();
      if (!epinCode) {
        toast({ title: 'Registration failed', description: 'E-Pin is required', variant: 'destructive' });
        return false;
      }

      console.log('Validating E-PIN:', epinCode);
      const { data: epinRow, error: epinErr } = await supabase
        .from('epins')
        .select('*')
        .eq('code', epinCode)
        .maybeSingle();

      console.log('E-PIN validation result:', { epinRow, epinErr });

      if (epinErr || !epinRow) {
        console.error('E-PIN error:', epinErr);
        toast({ title: 'Invalid E-Pin', description: 'Please verify your E-Pin and try again.', variant: 'destructive' });
        return false;
      }

      if (epinRow.is_used) {
        console.log('E-PIN already used');
        toast({ title: 'E-Pin Already Used', description: 'This E-Pin has already been used.', variant: 'destructive' });
        return false;
      }

      // 3) Create auth user with alias to allow multi-account per email
      console.log('Creating auth user');
      const redirectUrl = `${window.location.origin}/login`;
      const realEmail = (userData.email || '').trim();
      const aliasEmail = `${cleanUsername.toLowerCase().replace(/\s+/g, '')}+${Date.now()}@breadwinners.app`;
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: aliasEmail,
        password: (userData.password || '').trim(),
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: userData.fullName.trim(),
            username: cleanUsername,
            phone: userData.mobile.trim(),
            id_number: userData.idNumber,
            referrer_code: userData.sponsorId?.trim() || null,
            own_referral_code: `BW${Math.floor(100000 + Math.random() * 900000)}`,
            physical_address: userData.physicalAddress?.trim(),
            province: userData.province,
            age: userData.age,
            gender: userData.gender,
            real_email: realEmail
          }
        }
      });

      console.log('Auth signup result:', { signUpData, signUpError });

      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message?.includes('duplicate') || signUpError.message?.includes('already exists')) {
          toast({ 
            title: 'Registration failed', 
            description: 'This username or email is already registered. Please try a different one.', 
            variant: 'destructive' 
          });
        } else {
          toast({ 
            title: 'Registration failed', 
            description: signUpError.message || 'Could not create account. Please try again.', 
            variant: 'destructive' 
          });
        }
        return false;
      }

      // IMPORTANT: Do not mutate wallets/commissions from client. The DB trigger (handle_new_user)
      // creates profile, wallet, network position and awards commission to sponsor.
      // Also do not attempt to update the E-Pin here due to RLS. Admins handle that.

      // If a session was created (email confirmations disabled), hydrate and go to dashboard.
      if (signUpData.session?.user) {
        await hydrateUserFromSupabase(signUpData.session.user.id);
        toast({ title: `Welcome to Breadwinners, ${userData.fullName}!` });
        // Save credentials for convenience
        localStorage.setItem('rememberedCredentials', JSON.stringify({
          username: userData.username,
          password: userData.password
        }));
        navigate('/dashboard');
        return true;
      }

      // Otherwise, guide the user to confirm email, then log in.
      toast({
        title: 'Verify your email',
        description: 'We sent you a confirmation link. After verifying, please sign in.',
      });
      navigate('/login');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({ title: 'Registration error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('breadwinners_user');
    localStorage.removeItem('rememberedCredentials');
    toast({ title: "Logged out successfully" });
    navigate('/');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link. Please check your inbox and spam folder.",
      });
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      resetPassword,
      isAuthenticated,
      isAdmin,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};