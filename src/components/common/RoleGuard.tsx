import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from './Button';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Access Restricted
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your current account role (<span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{role}</span>) does not have authorization to view this module.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link to="/">
              <Button variant="primary" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Return to My Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
