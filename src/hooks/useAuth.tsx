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
  isAuthenticated: boolean;
  isAdmin: boolean;
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
      isAuthenticated: false,
      isAdmin: false,
    } as AuthContextType;
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const hydrateUserFromSupabase = async (userId: string): Promise<User | null> => {
    try {
      const [
        { data: roleData },
        { data: profileData },
        { data: walletData },
        { data: networkData }
      ] = await Promise.all([
        supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle(),
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('wallets').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('network_tree').select('*').eq('user_id', userId).maybeSingle(),
      ]);

      const admin = !!roleData;

      if (!profileData) return null;

      const baseUser: User = {
        id: userId,
        memberId: profileData.id,
        fullName: profileData.full_name,
        username: profileData.username,
        email: profileData.email,
        mobile: profileData.phone || '',
        level: networkData?.level || 1,
        stage: networkData?.stage || 1,
        earnings: walletData?.total_earned || 0,
        directRecruits: profileData.direct_recruits || 0,
        totalRecruits: profileData.total_recruits || 0,
        isActive: true,
        joinDate: profileData.created_at,
        wallets: {
          eWallet: walletData?.e_wallet_balance || 0,
          registrationWallet: walletData?.registration_wallet_balance || 250,
          incentiveWallet: walletData?.incentive_wallet_balance || 0
        }
      };

      setUser(baseUser);
      setIsAdmin(admin);
      localStorage.setItem('breadwinners_user', JSON.stringify(baseUser));
      return baseUser;
    } catch (e) {
      console.error('Failed to hydrate user:', e);
      return null;
    }
  };

  // Keep auth state in sync without forcing sign-out on refresh
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Defer any Supabase calls to avoid deadlocks
        setTimeout(() => {
          hydrateUserFromSupabase(session.user!.id);
        }, 0);
      } else {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('breadwinners_user');
      }
    });

    // Initialize from existing session (if any)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setTimeout(() => {
          hydrateUserFromSupabase(session.user!.id);
        }, 0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Trim and clean inputs
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();
      
      let email = cleanUsername;
      let isAdminLogin = false;
      
      // Check if this is admin login (contains @)
      if (cleanUsername.includes('@')) {
        isAdminLogin = true;
        email = cleanUsername;
      } else {
        // For regular users, resolve email using secure RPC (supports username or BWN ID, case-insensitive)
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
        // Check if user has admin role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        const isUserAdmin = !!roleData;

        // If attempting email login but not admin, block and sign out
        if (isAdminLogin && !isUserAdmin) {
          await supabase.auth.signOut();
          toast({
            title: "Login blocked",
            description: "Please use your username to log in.",
            variant: "destructive"
          });
          return false;
        }

        // Hydrate user profile and roles safely
        const hydrated = await hydrateUserFromSupabase(data.user.id);
        if (hydrated) {
          toast({ title: isUserAdmin ? "Welcome back, Administrator!" : `Welcome back, ${hydrated.fullName}!` });
          navigate(isUserAdmin ? '/admin' : '/dashboard');
          return true;
        }

        // If hydration failed, sign out and show error to avoid ghost login
        await supabase.auth.signOut();
        toast({
          title: "Login failed",
          description: "Could not load your profile. Please try again.",
          variant: "destructive"
        });
        return false;

      }

      // Removed insecure hardcoded admin fallback. Please use Supabase email/password login.

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
        description: "An error occurred during login",
        variant: "destructive"
      });
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    // Minimal, reliable flow to avoid hangs. We only validate E-PIN, create auth user, and exit.
    try {
      console.log('Registration started', { username: userData.username });
      
      // 1) Validate E-PIN exists (read-only). Use maybeSingle to avoid throwing.
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

      // 2) Create auth user. Supabase may require email confirmation.
      console.log('Creating auth user');
      const redirectUrl = `${window.location.origin}/login`;
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: (userData.email || '').trim(),
        password: (userData.password || '').trim(),
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: userData.fullName,
            username: userData.username,
            phone: userData.mobile,
            id_number: userData.idNumber,
            referrer_code: userData.sponsorId || null,
            own_referral_code: `BW${Math.floor(100000 + Math.random() * 900000)}`,
            physical_address: userData.physicalAddress,
            province: userData.province,
            age: userData.age,
            gender: userData.gender
          }
        }
      });

      console.log('Auth signup result:', { signUpData, signUpError });

      if (signUpError) {
        toast({ title: 'Registration failed', description: signUpError.message || 'Could not create account', variant: 'destructive' });
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

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};