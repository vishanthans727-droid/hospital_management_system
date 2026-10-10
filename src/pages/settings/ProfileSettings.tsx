import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { User, Mail, Phone, Shield, Lock, Bell, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfileSettings: React.FC = () => {
  const { user, role, updateProfile, resetPassword } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    await updateProfile({
      fullName,
      phone,
      avatarUrl,
    });
    setIsUpdating(false);
  };

  const handleTriggerReset = async () => {
    if (user?.email) {
      await resetPassword(user.email);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-sky-600" />
          User Profile & Security Settings
        </h1>
        <p className="text-xs text-slate-500">
          Manage your personal credentials, communication preferences, and security access
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card text-center space-y-4">
          <div className="relative inline-block mx-auto">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-sky-500/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-3xl">
                {fullName.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">{user?.fullName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <div className="mt-2">
              <Badge variant="primary" size="md">
                <Shield className="w-3.5 h-3.5 mr-1" />
                {role?.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 text-left space-y-1">
            <p>Account ID: <span className="font-mono text-slate-700 dark:text-slate-300">{user?.id}</span></p>
            <p>Security Clearance: <span className="text-emerald-600 font-semibold">HIPAA Level 3</span></p>
          </div>
        </div>

        {/* Update Form */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Personal Information
            </h3>

            <div>
              <label className="block font-semibold mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Profile Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" type="submit" isLoading={isUpdating}>
                Save Profile Changes
              </Button>
            </div>
          </form>

          {/* Password Section */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-600" />
              Password & Authentication Security
            </h3>
            <p className="text-slate-500">
              Trigger a secure password recovery flow sent directly to your registered hospital email address.
            </p>
            <Button variant="outline" size="sm" onClick={handleTriggerReset}>
              Send Password Reset Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
