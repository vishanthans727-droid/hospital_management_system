import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Patient, Doctor, Staff } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  findRegisteredUser,
  addRegisteredAccount,
  addStoredDoctor,
  addStoredStaff,
  addStoredPatient,
  RegisteredAccount,
  updateUserPassword,
} from '../lib/storage';
import { mockDepartments } from '../lib/mockData';
import { generateCustomId } from '../lib/utils';
import toast from 'react-hot-toast';

export interface RegisterDetails {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  specialization?: string;
  shift?: 'morning' | 'evening' | 'night';
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: Patient['bloodGroup'];
  address?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerUser: (details: RegisterDetails) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (email: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'medicare_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Only allow registered persons - null by default if no registered session
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          return parsed;
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
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
        console.error('Auth session sync error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isSupabaseConfigured && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
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
            const userProfile: UserProfile = {
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              role: profile.role,
              avatarUrl: profile.avatar_url,
              phone: profile.phone,
              departmentId: profile.department_id,
              departmentName: profile.department_name,
              isActive: profile.is_active,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            };
            setUser(userProfile);
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
            toast.success(`Logged in as ${userProfile.role.toUpperCase()}: ${userProfile.fullName}`);
            setIsLoading(false);
            return true;
          }
        }
      }

      // Check registered users in storage
      const matched = findRegisteredUser(cleanEmail);
      if (!matched) {
        toast.error('No registered account found with this email. Please register first.');
        setIsLoading(false);
        return false;
      }

      if (matched.passwordHash && password && matched.passwordHash !== password) {
        toast.error('Incorrect password. Please try again.');
        setIsLoading(false);
        return false;
      }

      const activeUser: UserProfile = {
        id: matched.id,
        email: matched.email,
        fullName: matched.fullName,
        role: matched.role,
        avatarUrl: matched.avatarUrl,
        phone: matched.phone,
        departmentId: matched.departmentId,
        departmentName: matched.departmentName,
        isActive: matched.isActive,
        createdAt: matched.createdAt,
        updatedAt: matched.updatedAt,
      };

      setUser(activeUser);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(activeUser));
      toast.success(`Welcome back, ${activeUser.fullName} (${activeUser.role.toUpperCase()})`);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Supabase signout warning:', e);
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    toast.success('Successfully logged out');
    setIsLoading(false);
  };

  const registerUser = async (details: RegisterDetails): Promise<boolean> => {
    setIsLoading(true);
    const cleanEmail = details.email.trim().toLowerCase();

    try {
      // Check if email already registered
      const existing = findRegisteredUser(cleanEmail);
      if (existing) {
        toast.error('An account with this email address already exists. Please log in.');
        setIsLoading(false);
        return false;
      }

      if (isSupabaseConfigured && details.password) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: details.password,
          options: {
            data: {
              full_name: details.fullName,
              role: details.role,
              phone: details.phone,
            },
          },
        });
        if (error) {
          toast.error(error.message);
          setIsLoading(false);
          return false;
        }
      }

      const newAccount: RegisteredAccount = {
        id: `usr-${details.role.slice(0, 3)}-${Date.now()}`,
        email: cleanEmail,
        fullName: details.fullName.trim(),
        role: details.role,
        phone: details.phone.trim(),
        passwordHash: details.password || '',
        departmentId: details.departmentId,
        departmentName: details.departmentName,
        specialization: details.specialization,
        shift: details.shift,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addRegisteredAccount(newAccount);

      // Create role-specific clinical entry
      if (details.role === 'doctor') {
        const dept = mockDepartments.find(d => d.id === details.departmentId) || mockDepartments[0];
        const newDoctor: Doctor = {
          id: `doc-${Date.now()}`,
          userId: newAccount.id,
          doctorId: generateCustomId('DOC'),
          fullName: newAccount.fullName,
          email: newAccount.email,
          phone: newAccount.phone || '+1 555-0000',
          departmentId: dept.id,
          departmentName: dept.name,
          specialization: details.specialization || 'General Medicine',
          qualifications: 'MBBS, MD',
          licenseNumber: `LIC-${Math.floor(10000 + Math.random() * 90000)}`,
          consultationFee: 150,
          availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          startTime: '09:00',
          endTime: '17:00',
          isAvailableToday: true,
        };
        addStoredDoctor(newDoctor);
      } else if (details.role === 'nurse' || details.role === 'receptionist') {
        const dept = mockDepartments.find(d => d.id === details.departmentId) || mockDepartments[0];
        const newStaff: Staff = {
          id: `stf-${Date.now()}`,
          userId: newAccount.id,
          staffId: generateCustomId('STF'),
          fullName: newAccount.fullName,
          email: newAccount.email,
          phone: newAccount.phone || '+1 555-0000',
          role: details.role,
          departmentId: dept.id,
          departmentName: dept.name,
          shift: details.shift || 'morning',
          joinDate: new Date().toISOString().slice(0, 10),
          isActive: true,
        };
        addStoredStaff(newStaff);
      } else if (details.role === 'patient') {
        const newPatient: Patient = {
          id: `pat-${Date.now()}`,
          patientId: generateCustomId('PAT'),
          fullName: newAccount.fullName,
          email: newAccount.email,
          phone: newAccount.phone || '+1 555-0000',
          dateOfBirth: '1995-01-01',
          gender: details.gender || 'other',
          bloodGroup: details.bloodGroup || 'O+',
          address: details.address || 'Address on file',
          emergencyContactName: 'Family Contact',
          emergencyContactPhone: newAccount.phone || '+1 555-0000',
          emergencyContactRelation: 'Relative',
          allergies: [],
          chronicConditions: [],
          isArchived: false,
          admissionStatus: 'outpatient',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addStoredPatient(newPatient);
      }

      // Automatically sign in the registered user
      const userProfile: UserProfile = {
        id: newAccount.id,
        email: newAccount.email,
        fullName: newAccount.fullName,
        role: newAccount.role,
        phone: newAccount.phone,
        departmentId: newAccount.departmentId,
        departmentName: newAccount.departmentName,
        isActive: true,
        createdAt: newAccount.createdAt,
        updatedAt: newAccount.updatedAt,
      };

      setUser(userProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userProfile));
      toast.success(`Registered successfully as ${details.role.toUpperCase()}! Welcome, ${details.fullName}`);
      setIsLoading(false);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
      setIsLoading(false);
      return false;
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
    toast.success('Profile details updated');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        toast.error(error.message);
        return false;
      }
    }
    toast.success('Password reset instructions sent to your email');
    return true;
  };

  const updatePassword = async (email: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (error) {
            console.warn('Supabase password update note:', error.message);
          }
        } catch (e) {
          console.warn('Supabase updateUser error:', e);
        }
      }

      // Check registered users in storage
      const matched = findRegisteredUser(cleanEmail);
      if (!matched) {
        toast.error(`No account found with email "${cleanEmail}". Please check your email or register.`);
        setIsLoading(false);
        return false;
      }

      const success = updateUserPassword(cleanEmail, newPassword);
      if (success) {
        toast.success(`Password successfully updated for ${matched.fullName}! You can now sign in.`);
        setIsLoading(false);
        return true;
      } else {
        toast.error('Failed to update password. Please try again.');
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating password');
      setIsLoading(false);
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
        registerUser,
        updateProfile,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
