import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  id_number: string;
  own_referral_code: string;
  referrer_code: string | null;
  direct_recruits: number;
  total_recruits: number;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  e_wallet_balance: number;
  registration_wallet_balance: number;
  incentive_wallet_balance: number;
  total_earned: number;
  total_withdrawn: number;
}

export interface User {
  id: string;
  profile: Profile;
  wallet: Wallet;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  phone: string;
  idNumber: string;
  sponsor: string;
  sponsorId: string;
  ePin: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Set up auth state listener and check for existing session
  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(async () => {
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', currentSession.user.id)
                .single();

              if (profileError) throw profileError;

              const { data: wallet, error: walletError } = await supabase
                .from('wallets')
                .select('*')
                .eq('user_id', currentSession.user.id)
                .single();

              if (walletError) throw walletError;

              const { data: roles } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', currentSession.user.id);

              const isAdmin = roles?.some(r => r.role === 'admin') || false;

              setUser({
                id: currentSession.user.id,
                profile: profile as Profile,
                wallet: wallet as Wallet,
                isAdmin
              });
            } catch (error) {
              console.error('Error fetching user data:', error);
              setUser(null);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession) {
        setSession(currentSession);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast.success('Welcome back!');
      
      // Check if user is admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id);

      if (roles?.some(r => r.role === 'admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      // Generate referral code before signup
      const referralCode = `BW${Date.now().toString().slice(-6)}`;

      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: data.username,
            full_name: data.fullName,
            phone: data.phone,
            id_number: data.idNumber,
            own_referral_code: referralCode,
            referrer_code: data.sponsorId,
            parent_id: null // Will be set based on referrer_code in trigger
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('User creation failed');

      // Send registration confirmation email (without password)
      try {
        await supabase.functions.invoke('send-registration-email', {
          body: {
            email: data.email,
            fullName: data.fullName,
            username: data.username,
            memberId: referralCode
          }
        });
      } catch (emailError) {
        console.error('Failed to send registration email:', emailError);
      }

      // Send downline notification to sponsor
      if (data.sponsorId) {
        try {
          await supabase.functions.invoke('send-downline-notification', {
            body: {
              sponsorId: data.sponsorId,
              newMemberName: data.fullName,
              newMemberId: referralCode
            }
          });
        } catch (emailError) {
          console.error('Failed to send downline notification:', emailError);
        }
      }

      toast.success('Registration successful! Please check your email to confirm your account.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      navigate('/');
      toast.info('Logged out successfully');
    } catch (error: any) {
      toast.error('Logout failed');
    }
  };

  const isAuthenticated = !!session && !!user;
  const isAdmin = user?.isAdmin || false;

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
