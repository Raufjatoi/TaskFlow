
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, type AuthUser } from '@/services/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, companyName?: string, companyCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    let mounted = true;
    
    // Get initial user
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (mounted) {
          console.log('AuthProvider: Initial user:', currentUser);
          setUser(currentUser);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider: Error getting initial user:', error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((authUser) => {
      if (mounted) {
        console.log('AuthProvider: Auth state changed:', authUser);
        setUser(authUser);
        if (!isLoading) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth listener');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('AuthProvider: Login attempt for:', email);
    try {
      await authService.signIn(email, password);
      console.log('AuthProvider: Login successful');
      // User will be updated via onAuthStateChange
    } catch (error) {
      console.error('AuthProvider: Login failed:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, companyName?: string, companyCode?: string) => {
    console.log('AuthProvider: Signup attempt for:', email);
    try {
      await authService.signUp(email, password, name, companyName, companyCode);
      console.log('AuthProvider: Signup successful');
      // User will be updated via onAuthStateChange
    } catch (error) {
      console.error('AuthProvider: Signup failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log('AuthProvider: Logout attempt');
    await authService.signOut();
    setUser(null);
    console.log('AuthProvider: Logout complete');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
