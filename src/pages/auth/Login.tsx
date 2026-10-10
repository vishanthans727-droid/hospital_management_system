import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { HeartPulse, Lock, Mail, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types';

export const Login: React.FC = () => {
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      navigate('/');
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    switchDemoRole(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-xl shadow-sky-600/30">
            <HeartPulse className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Medi<span className="text-sky-600">Care</span> Systems
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enterprise Clinical Administration & Healthcare Portal
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Hospital Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. admin@medicare.health"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5"
              isLoading={isLoading}
            >
              Sign In to Hospital Portal
            </Button>
          </form>

          {/* Instant Demo Switcher */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Quick Role One-Click Sign In (Demo Mode)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoLogin('administrator')}
                className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 font-medium text-left truncate transition"
              >
                🏥 Administrator
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('doctor')}
                className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900 border border-teal-200 dark:border-teal-800 font-medium text-left truncate transition"
              >
                🩺 Doctor
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('nurse')}
                className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 font-medium text-left truncate transition"
              >
                💉 Head Nurse
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('receptionist')}
                className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 border border-amber-200 dark:border-amber-800 font-medium text-left truncate transition"
              >
                📋 Receptionist
              </button>
            </div>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('patient')}
                className="w-full p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 font-medium text-center text-xs transition"
              >
                👤 Patient Portal
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>New patient seeking care? </span>
            <Link to="/register" className="text-sky-600 hover:text-sky-700 font-semibold">
              Register Patient Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
