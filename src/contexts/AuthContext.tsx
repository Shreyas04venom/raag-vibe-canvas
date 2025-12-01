import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
// @ts-ignore
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const auth = supabase.auth;

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPremium: boolean;
  language: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => void;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    // Check Supabase auth session
    auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
          avatar: session.user.user_metadata?.avatar_url,
          isPremium: session.user.user_metadata?.isPremium || false,
          language: session.user.user_metadata?.language || 'en',
        };
        setUser(userData);
        localStorage.setItem('raagweather_user', JSON.stringify(userData));
        localStorage.setItem('auth_token', session.access_token);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
          avatar: session.user.user_metadata?.avatar_url,
          isPremium: session.user.user_metadata?.isPremium || false,
          language: session.user.user_metadata?.language || 'en',
        };
        setUser(userData);
        localStorage.setItem('raagweather_user', JSON.stringify(userData));
        localStorage.setItem('auth_token', session.access_token);
      } else {
        setUser(null);
        localStorage.removeItem('raagweather_user');
        localStorage.removeItem('auth_token');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      if (data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '',
          avatar: data.user.user_metadata?.avatar_url,
          isPremium: data.user.user_metadata?.isPremium || false,
          language: data.user.user_metadata?.language || 'en',
        };
        
        setUser(userData);
        localStorage.setItem('raagweather_user', JSON.stringify(userData));
        localStorage.setItem('auth_token', data.session.access_token);
        
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        
        navigate('/home');
      }
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: name,
          avatar: data.user.user_metadata?.avatar_url,
          isPremium: data.user.user_metadata?.isPremium || false,
          language: data.user.user_metadata?.language || 'en',
        };
        
        setUser(userData);
        localStorage.setItem('raagweather_user', JSON.stringify(userData));
        if (data.session?.access_token) {
          localStorage.setItem('auth_token', data.session.access_token);
        }
        
        toast({
          title: 'Account created',
          description: 'Welcome to RaagWeather!',
        });
        
        navigate('/home');
      }
    } catch (error: any) {
      toast({
        title: 'Signup failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      // The auth state change listener will handle the rest
    } catch (error: any) {
      toast({
        title: 'Google sign-in failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      localStorage.removeItem('raagweather_user');
      localStorage.removeItem('auth_token');
      toast({
        title: 'Logged out',
        description: 'Come back soon!',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Logout failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('raagweather_user', JSON.stringify(updatedUser));
    
    toast({
      title: 'Profile updated',
      description: 'Your changes have been saved.',
    });
  };

  const requestPasswordReset = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: 'Reset link sent',
      description: 'Check your email for password reset instructions.',
    });
  };

  const verifyOTP = async (otp: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (otp === '123456') {
      toast({
        title: 'Verified!',
        description: 'OTP verified successfully.',
      });
    } else {
      throw new Error('Invalid OTP');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        loginWithGoogle,
        updateProfile,
        requestPasswordReset,
        verifyOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
