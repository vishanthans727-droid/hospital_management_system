import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { HeartPulse, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    const ok = await resetPassword(email);
    setIsLoading(false);
    if (ok) setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-xl shadow-sky-600/30">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Account Recovery
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Secure password reset through verified email link
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Recovery Link Dispatched
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                If an account exists matching <span className="font-semibold">{email}</span>, password reset instructions have been sent.
              </p>
              <Link to="/login">
                <Button variant="primary" className="mt-4 w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Enter Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="doctor@medicare.health"
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
                Send Password Reset Instructions
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 inline-flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
