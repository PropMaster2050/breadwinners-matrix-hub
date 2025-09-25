import { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: string;
  memberId: string;
  fullName: string;
  username: string;
  mobile: string;
  sponsorId?: string;
  level: number;
  earnings: number;
  directRecruits: number;
  totalRecruits: number;
  isActive: boolean;
  joinDate: string;
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
  mobile: string;
  sponsorId?: string;
  epin: string;
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
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('breadwinners_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Admin login
      if (username === 'admin' && password === 'admin10') {
        const adminUser: User = {
          id: 'admin',
          memberId: 'ADMIN001',
          fullName: 'System Administrator',
          username: 'admin',
          mobile: '+27123456789',
          level: 8,
          earnings: 0,
          directRecruits: 0,
          totalRecruits: 0,
          isActive: true,
          joinDate: new Date().toISOString()
        };
        setUser(adminUser);
        localStorage.setItem('breadwinners_user', JSON.stringify(adminUser));
        toast({ title: "Welcome back, Administrator!" });
        navigate('/admin');
        return true;
      }

      // Regular user login - check against stored users
      const storedUsers = JSON.parse(localStorage.getItem('breadwinners_users') || '[]');
      const foundUser = storedUsers.find((u: any) => 
        u.username === username && u.password === password
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('breadwinners_user', JSON.stringify(userWithoutPassword));
        toast({ title: `Welcome back, ${foundUser.fullName}!` });
        navigate('/dashboard');
        return true;
      }

      toast({ 
        title: "Login failed", 
        description: "Invalid username or password",
        variant: "destructive" 
      });
      return false;
    } catch (error) {
      toast({ 
        title: "Login error", 
        description: "An error occurred during login",
        variant: "destructive" 
      });
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      // Validate e-pin
      const storedEpins = JSON.parse(localStorage.getItem('breadwinners_epins') || '[]');
      const validEpin = storedEpins.find((epin: any) => 
        epin.code === userData.epin && !epin.isUsed
      );

      if (!validEpin) {
        toast({ 
          title: "Registration failed", 
          description: "Invalid or already used e-pin",
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

      // Create new user
      const newUser: User & { password: string } = {
        id: `user_${Date.now()}`,
        memberId: `BW${String(storedUsers.length + 1).padStart(6, '0')}`,
        fullName: userData.fullName,
        username: userData.username,
        password: userData.password,
        mobile: userData.mobile,
        sponsorId: userData.sponsorId,
        level: 1,
        earnings: 0,
        directRecruits: 0,
        totalRecruits: 0,
        isActive: true,
        joinDate: new Date().toISOString()
      };

      // Save user
      storedUsers.push(newUser);
      localStorage.setItem('breadwinners_users', JSON.stringify(storedUsers));

      // Mark e-pin as used
      validEpin.isUsed = true;
      validEpin.usedBy = newUser.memberId;
      validEpin.usedDate = new Date().toISOString();
      localStorage.setItem('breadwinners_epins', JSON.stringify(storedEpins));

      // Auto-login after registration
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('breadwinners_user', JSON.stringify(userWithoutPassword));

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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('breadwinners_user');
    toast({ title: "Logged out successfully" });
    navigate('/');
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.username === 'admin';

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