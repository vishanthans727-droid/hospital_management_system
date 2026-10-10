import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockUsers } from '../lib/mockData';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerPatient: (details: { fullName: string; email: string; phone: string; password?: string }) => Promise<boolean>;
  switchDemoRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'medicare_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Admin demo user if nothing is stored
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockUsers[0];
      }
    }
    return mockUsers[0]; // Eleanor Vance (Administrator)
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch user profile from Supabase profiles table
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              const mappedUser: UserProfile = {
                id: profile.id,
                email: profile.email || session.user.email || '',
                fullName: profile.full_name || 'Healthcare User',
                role: profile.role as UserRole,
                avatarUrl: profile.avatar_url,
                phone: profile.phone,
                departmentId: profile.department_id,
                departmentName: profile.department_name,
                isActive: profile.is_active ?? true,
                createdAt: profile.created_at,
                updatedAt: profile.updated_at,
              };
              setUser(mappedUser);
              localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mappedUser));
            }
          }
        }
      } catch (err) {
        console.error('Supabase auth session sync error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          toast.error(error.message);
          setIsLoading(false);
          return false;
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            const mappedUser: UserProfile = {
              id: profile.id,
              email: profile.email || data.user.email || '',
              fullName: profile.full_name || 'Healthcare User',
              role: profile.role as UserRole,
              avatarUrl: profile.avatar_url,
              phone: profile.phone,
              departmentId: profile.department_id,
              departmentName: profile.department_name,
              isActive: profile.is_active ?? true,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            };
            setUser(mappedUser);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mappedUser));
            toast.success(`Welcome back, ${mappedUser.fullName}`);
            setIsLoading(false);
            return true;
          }
        }
      }

      // Check mock user fallback
      const found = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setUser(found);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(found));
        toast.success(`Signed in as ${found.fullName} (${found.role.toUpperCase()})`);
        setIsLoading(false);
        return true;
      }

      // Custom email match
      const fallbackUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        fullName: email.split('@')[0].replace(/[._]/g, ' '),
        role: email.includes('admin') ? 'administrator' : email.includes('doctor') ? 'doctor' : 'patient',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(fallbackUser));
      toast.success(`Signed in as ${fallbackUser.fullName}`);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please verify credentials.');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Signout warning', e);
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    toast.success('Logged out successfully');
  };

  const registerPatient = async (details: { fullName: string; email: string; phone: string; password?: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && details.password) {
        const { data, error } = await supabase.auth.signUp({
          email: details.email,
          password: details.password,
          options: {
            data: {
              full_name: details.fullName,
              role: 'patient', // Enforce patient role during registration (never admin)
              phone: details.phone,
            },
          },
        });
        if (error) {
          toast.error(error.message);
          setIsLoading(false);
          return false;
        }
        toast.success('Registration successful. Please verify email if confirmation is enabled.');
      }

      const newPatientUser: UserProfile = {
        id: `usr-pat-${Date.now()}`,
        email: details.email,
        fullName: details.fullName,
        role: 'patient',
        phone: details.phone,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(newPatientUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newPatientUser));
      toast.success(`Account created! Welcome, ${details.fullName}`);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
      setIsLoading(false);
      return false;
    }
  };

  const switchDemoRole = (targetRole: UserRole) => {
    const roleMatch = mockUsers.find(u => u.role === targetRole);
    if (roleMatch) {
      setUser(roleMatch);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(roleMatch));
      toast.success(`Role switched to ${targetRole.toUpperCase()}: ${roleMatch.fullName}`);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    setUser(updated);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    if (isSupabaseConfigured) {
      await supabase.from('profiles').update({
        full_name: updated.fullName,
        phone: updated.phone,
        avatar_url: updated.avatarUrl,
        updated_at: updated.updatedAt,
      }).eq('id', user.id);
    }
    toast.success('Profile updated successfully');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          toast.error(error.message);
          return false;
        }
      }
      toast.success('Password reset instructions sent to your email.');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to send password reset');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        isSupabaseConnected: isSupabaseConfigured,
        login,
        logout,
        registerPatient,
        switchDemoRole,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
