import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  defaultIsp?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, fullName?: string, defaultIsp?: string) => Promise<void>;
  signInAsDemoUser: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('netpulse_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default demo user for instant accessibility
    return {
      id: 'default-user',
      email: 'admin@netpulse.ai',
      fullName: 'Alex Reynolds (Admin)',
      defaultIsp: 'AT&T Fiber 1Gbps'
    };
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u: AuthUser = {
          id: session.user.id,
          email: session.user.email || 'user@netpulse.ai',
          fullName: session.user.user_metadata?.full_name || 'Network Administrator',
          defaultIsp: session.user.user_metadata?.default_isp || 'Fiber Gigabit'
        };
        setUser(u);
        localStorage.setItem('netpulse_user', JSON.stringify(u));
        localStorage.setItem('netpulse_auth_token', session.access_token);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u: AuthUser = {
          id: session.user.id,
          email: session.user.email || 'user@netpulse.ai',
          fullName: session.user.user_metadata?.full_name || 'Network Administrator',
          defaultIsp: session.user.user_metadata?.default_isp || 'Fiber Gigabit'
        };
        setUser(u);
        localStorage.setItem('netpulse_user', JSON.stringify(u));
        localStorage.setItem('netpulse_auth_token', session.access_token);
      } else {
        // Keep existing user if demo mode, else null
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      if (data.session) {
        const u: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: data.user.user_metadata?.full_name || 'Network Engineer',
          defaultIsp: data.user.user_metadata?.default_isp || 'Fiber'
        };
        setUser(u);
        localStorage.setItem('netpulse_user', JSON.stringify(u));
        localStorage.setItem('netpulse_auth_token', data.session.access_token);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, fullName?: string, defaultIsp?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
            default_isp: defaultIsp
          }
        }
      });
      if (error) throw error;
      if (data.session) {
        const u: AuthUser = {
          id: data.user!.id,
          email: data.user!.email || email,
          fullName: fullName || 'Network Engineer',
          defaultIsp: defaultIsp || 'Fiber'
        };
        setUser(u);
        localStorage.setItem('netpulse_user', JSON.stringify(u));
        localStorage.setItem('netpulse_auth_token', data.session.access_token);
      }
    } finally {
      setLoading(false);
    }
  };

  const signInAsDemoUser = () => {
    const demo: AuthUser = {
      id: 'default-user',
      email: 'demo@netpulse.ai',
      fullName: 'Enterprise Network Lead',
      defaultIsp: 'AT&T Fiber 1Gbps'
    };
    setUser(demo);
    localStorage.setItem('netpulse_user', JSON.stringify(demo));
    localStorage.setItem('netpulse_auth_token', 'demo-token');
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignored
    }
    setUser(null);
    localStorage.removeItem('netpulse_user');
    localStorage.removeItem('netpulse_auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signInAsDemoUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
