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
    throw new Error('useAuth must be used within an AuthProvider');
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

  // Keep auth state in sync and avoid ghost logins
  useEffect(() => {
    // Clear any existing sessions first
    const clearSession = async () => {
      await supabase.auth.signOut();
      setUser(null);
      setIsAdmin(false);
      localStorage.removeItem('breadwinners_user');
    };
    
    clearSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Only hydrate if this is a new login (not auto-restore)
        if (_event === 'SIGNED_IN') {
          setTimeout(() => {
            hydrateUserFromSupabase(session.user!.id);
          }, 0);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('breadwinners_user');
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
        // For regular users, look up email from profiles using username
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', cleanUsername)
          .maybeSingle();
        
        if (profileData?.email) {
          email = profileData.email;
        } else {
          // Username not found
          toast({
            title: "Login failed",
            description: "Username not found. Please check your username.",
            variant: "destructive"
          });
          return false;
        }
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
    try {
      // Validate e-pin from database
      const { data: epinData, error: epinError } = await supabase
        .from('epins')
        .select('*')
        .eq('code', userData.epin.toUpperCase())
        .single();

      if (epinError || !epinData) {
        toast({ 
          title: "Registration failed", 
          description: "Invalid e-pin code. Please check and try again.",
          variant: "destructive" 
        });
        return false;
      }

      if (epinData.is_used) {
        toast({ 
          title: "E-Pin Already Used", 
          description: "This e-pin has already been used. Please contact support for assistance.",
          variant: "destructive" 
        });
        return false;
      }

      // Check if username already exists
      const storedUsers = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
      const existingUser = storedUsers.find((u: any) => u.username === userData.username);

      if (existingUser) {
        toast({ 
          title: "Registration failed", 
          description: "Username already exists",
          variant: "destructive" 
        });
        return false;
      }

      // Sign up user in Supabase Auth to centralize accounts
      const redirectUrl = `${window.location.origin}/login`;
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email || '',
        password: userData.password,
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

      if (signUpError) {
        toast({
          title: "Registration failed",
          description: signUpError.message || "Could not create account",
          variant: "destructive"
        });
        return false;
      }

      // Generate random member ID
      const randomSuffix = Math.floor(Math.random() * 900000) + 100000; // 6-digit random number
      const randomPrefix = Math.floor(Math.random() * 900) + 100; // 3-digit random number
      
      // Create new user
      const newUser: User & { password: string } = {
        id: `user_${Date.now()}`,
        memberId: `BW${randomPrefix}${randomSuffix}`,
        fullName: userData.fullName,
        username: userData.username,
        password: userData.password,
        mobile: userData.mobile,
        email: userData.email,
        physicalAddress: userData.physicalAddress,
        province: userData.province,
        age: userData.age,
        gender: userData.gender,
        sponsorId: userData.sponsorId,
        level: 1,
        stage: 1,
        earnings: 0,
        directRecruits: 0,
        totalRecruits: 0,
        isActive: true,
        joinDate: new Date().toISOString(),
        transactionPin: userData.transactionPin,
        wallets: {
          eWallet: 0,
          registrationWallet: 0, // Start with R0 as requested
          incentiveWallet: 0
        },
        downlines: []
      };

      // Handle sponsor relationship and upline rewards
      if (userData.sponsorId) {
        const sponsor = storedUsers.find((u: any) => u.memberId === userData.sponsorId);
        if (sponsor) {
          // Add this user to sponsor's downlines at level 1
          if (!sponsor.downlines) sponsor.downlines = [];
          sponsor.downlines.push({
            memberId: newUser.memberId,
            fullName: newUser.fullName,
            joinDate: newUser.joinDate,
            level: 1,
            isActive: true
          });
          
          // Update sponsor's direct recruit stats
          sponsor.directRecruits += 1;
          sponsor.totalRecruits += 1;
          
          // Calculate sponsor's Stage 1 earnings (2×2 matrix)
          let sponsorStage1Count = 0;
          const sponsorDirects = sponsor.downlines.filter((d: any) => d.level === 1).slice(0, 2);
          sponsorStage1Count += sponsorDirects.length;
          
          // Count second-level recruits (grandchildren)
          sponsorDirects.forEach((direct: any) => {
            const directUser = storedUsers.find((u: any) => u.memberId === direct.memberId);
            if (directUser?.downlines) {
              const secondLevel = directUser.downlines.filter((d: any) => d.level === 1).slice(0, 2);
              sponsorStage1Count += secondLevel.length;
            }
          });
          
          // Cap at 6 members for Stage 1
          sponsorStage1Count = Math.min(sponsorStage1Count, 6);
          
          // Update sponsor's earnings based on Stage 1 matrix
          sponsor.earnings = sponsorStage1Count * 100;
          sponsor.wallets.eWallet = sponsorStage1Count * 100;
          
          // Update sponsor's wallet in Supabase
          const sponsorProfile = await supabase.from('profiles').select('user_id').eq('id', sponsor.memberId).maybeSingle();
          if (sponsorProfile.data?.user_id) {
            await supabase.from('wallets').update({
              e_wallet_balance: sponsor.wallets.eWallet,
              total_earned: sponsor.earnings
            }).eq('user_id', sponsorProfile.data.user_id);
            
            await supabase.from('profiles').update({
              direct_recruits: sponsor.directRecruits,
              total_recruits: sponsor.totalRecruits
            }).eq('user_id', sponsorProfile.data.user_id);
          }
          
          // Check if sponsor completed Stage 1 (6 members)
          if (sponsorStage1Count === 6 && sponsor.stage === 1) {
            sponsor.stage = 2; // Auto-promote to Stage 2
          }
          
          // Add upline info to new user
          newUser.uplineId = sponsor.memberId;
          newUser.uplineName = sponsor.fullName;
          
          // Also update grandparent's earnings if this is a second-level recruit
          if (sponsor.uplineId) {
            const grandparent = storedUsers.find((u: any) => u.memberId === sponsor.uplineId);
            if (grandparent) {
              // Add to grandparent's downlines at level 2
              if (!grandparent.downlines) grandparent.downlines = [];
              
              // Check if already exists at level 2
              const existingDownline = grandparent.downlines.find((d: any) => d.memberId === newUser.memberId);
              if (!existingDownline) {
                grandparent.downlines.push({
                  memberId: newUser.memberId,
                  fullName: newUser.fullName,
                  joinDate: newUser.joinDate,
                  level: 2,
                  isActive: true
                });
              }
              
              grandparent.totalRecruits += 1;
              
              // Recalculate grandparent's Stage 1 earnings
              let gpStage1Count = 0;
              const gpDirects = grandparent.downlines.filter((d: any) => d.level === 1).slice(0, 2);
              gpStage1Count += gpDirects.length;
              
              gpDirects.forEach((direct: any) => {
                const directUser = storedUsers.find((u: any) => u.memberId === direct.memberId);
                if (directUser?.downlines) {
                  const secondLevel = directUser.downlines.filter((d: any) => d.level === 1).slice(0, 2);
                  gpStage1Count += secondLevel.length;
                }
              });
              
              gpStage1Count = Math.min(gpStage1Count, 6);
              grandparent.earnings = gpStage1Count * 100;
              grandparent.wallets.eWallet = gpStage1Count * 100;
              
              // Check if grandparent completed Stage 1
              if (gpStage1Count === 6 && grandparent.stage === 1) {
                grandparent.stage = 2;
              }
              
              // Update grandparent's wallet in Supabase
              const gpProfile = await supabase.from('profiles').select('user_id').eq('id', grandparent.memberId).maybeSingle();
              if (gpProfile.data?.user_id) {
                await supabase.from('wallets').update({
                  e_wallet_balance: grandparent.wallets.eWallet,
                  total_earned: grandparent.earnings
                }).eq('user_id', gpProfile.data.user_id);
                
                await supabase.from('profiles').update({
                  total_recruits: grandparent.totalRecruits
                }).eq('user_id', gpProfile.data.user_id);
              }
            }
          }
        }
      }

      // Save user
      storedUsers.push(newUser);
      localStorage.setItem('breadwinners_users', JSON.stringify(storedUsers));

      // Mark e-pin as used in database
      const { error: updateError } = await supabase
        .from('epins')
        .update({ 
          is_used: true, 
          used_at: new Date().toISOString()
        })
        .eq('id', epinData.id);

      if (updateError) {
        console.error('Failed to mark e-pin as used:', updateError);
        // Continue with registration even if this fails
      }

      // Auto-login after registration
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('breadwinners_user', JSON.stringify(userWithoutPassword));
      
      // Save credentials for easy future login
      localStorage.setItem('rememberedCredentials', JSON.stringify({
        username: userData.username,
        password: userData.password
      }));

      toast({ title: `Welcome to Breadwinners, ${userData.fullName}!` });
      navigate('/dashboard');
      return true;
    } catch (error) {
      toast({ 
        title: "Registration error", 
        description: "An error occurred during registration",
        variant: "destructive" 
      });
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