
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  companyId: string;
  companyName: string;
  role: string;
}

export const authService = {
  async signUp(email: string, password: string, name: string, companyName?: string, companyCode?: string) {
    console.log('AuthService: Signing up user:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          company_name: companyName,
          company_code: companyCode,
        },
      },
    });

    if (error) {
      console.error('AuthService: Signup error:', error);
      // Provide more specific error messages
      if (error.message === 'User already registered') {
        throw new Error('An account with this email already exists. Please try logging in instead.');
      }
      throw error;
    }
    console.log('AuthService: Signup successful:', data);
    return data;
  },

  async signIn(email: string, password: string) {
    console.log('AuthService: Signing in user:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('AuthService: Signin error:', error);
      throw error;
    }
    console.log('AuthService: Signin successful:', data);
    return data;
  },

  async signOut() {
    console.log('AuthService: Signing out user');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('AuthService: Signout error:', error);
      throw error;
    }
    console.log('AuthService: Signout successful');
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    console.log('AuthService: Getting current user');
    
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('AuthService: Error getting user:', userError);
        return null;
      }
      
      if (!user) {
        console.log('AuthService: No authenticated user found');
        return null;
      }

      console.log('AuthService: Found authenticated user:', user.id);
      
      // Try to get profile from database with a timeout
      const profilePromise = supabase
        .from('profiles')
        .select(`
          name,
          company_id,
          role,
          companies (
            name
          )
        `)
        .eq('id', user.id)
        .maybeSingle();

      const { data: profile, error: profileError } = await profilePromise;

      if (profileError) {
        console.error('AuthService: Profile fetch error:', profileError);
        // Return basic user info if profile fetch fails
        return {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email!,
          companyId: 'temp',
          companyName: user.user_metadata?.company_name || 'Default Company',
          role: 'member',
        };
      }

      if (!profile) {
        console.log('AuthService: No profile found, creating basic user from auth data');
        // If no profile found, create a basic user object from auth metadata
        const authUser = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email!,
          companyId: 'temp',
          companyName: user.user_metadata?.company_name || 'Default Company',
          role: 'member',
        };
        console.log('AuthService: Returning basic user:', authUser);
        return authUser;
      }

      const authUser = {
        id: user.id,
        email: user.email!,
        name: profile.name || user.email!,
        companyId: profile.company_id || 'temp',
        companyName: profile.companies?.name || 'Unknown Company',
        role: profile.role || 'member',
      };

      console.log('AuthService: Current user with profile:', authUser);
      return authUser;
    } catch (error) {
      console.error('AuthService: Unexpected error in getCurrentUser:', error);
      return null;
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    console.log('AuthService: Setting up auth state change listener');
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthService: Auth state change event:', event, session?.user?.id);
      
      if (session?.user) {
        // Add a small delay to prevent rapid consecutive calls
        setTimeout(async () => {
          try {
            const user = await this.getCurrentUser();
            callback(user);
          } catch (error) {
            console.error('AuthService: Error in auth state change callback:', error);
            callback(null);
          }
        }, 100);
      } else {
        callback(null);
      }
    });
  },
};
