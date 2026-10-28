import React, { useState, useEffect } from 'react';
import { useAuth, RegisterDetails } from '../../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { mockDepartments } from '../../lib/mockData';
import { findRegisteredUser } from '../../lib/storage';
import { UserRole, Patient } from '../../types';
import {
  HeartPulse,
  Lock,
  Mail,
  User,
  Phone,
  Shield,
  Stethoscope,
  Activity,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  UserPlus,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';

const ROLE_OPTIONS: { role: UserRole; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    role: 'patient',
    title: 'Patient',
    desc: 'Access personal health records, prescriptions & appointments',
    icon: <User className="w-5 h-5 text-emerald-600" />,
  },
  {
    role: 'doctor',
    title: 'Doctor',
    desc: 'Consultations, EMR diagnosis, admissions & e-prescriptions',
    icon: <Stethoscope className="w-5 h-5 text-teal-600" />,
  },
  {
    role: 'nurse',
    title: 'Nurse',
    desc: 'Ward census, inpatient vitals, admissions & MAR administration',
    icon: <Activity className="w-5 h-5 text-indigo-600" />,
  },
  {
    role: 'receptionist',
    title: 'Receptionist',
    desc: 'Front desk intake, appointment scheduling & patient directory',
    icon: <ClipboardList className="w-5 h-5 text-amber-600" />,
  },
  {
    role: 'administrator',
    title: 'Administrator',
    desc: 'Hospital governance, department oversight, reports & audit trail',
    icon: <Shield className="w-5 h-5 text-sky-600" />,
  },
];

export const Register: React.FC = () => {
  const { registerUser, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const requestedMode =
    searchParams.get('tab') === 'reset' || searchParams.get('mode') === 'reset'
      ? 'resetPassword'
      : 'register';

  const [activeTab, setActiveTab] = useState<'register' | 'resetPassword'>(requestedMode);

  // Sync if URL query param changes
  useEffect(() => {
    if (searchParams.get('tab') === 'reset' || searchParams.get('mode') === 'reset') {
      setActiveTab('resetPassword');
    }
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setResetEmail(emailParam);
    }
  }, [searchParams]);

  // Register state
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Role-specific fields
  const [departmentId, setDepartmentId] = useState(mockDepartments[0].id);
  const [specialization, setSpecialization] = useState('');
  const [shift, setShift] = useState<'morning' | 'evening' | 'night'>('morning');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [bloodGroup, setBloodGroup] = useState<Patient['bloodGroup']>('O+');
  const [address, setAddress] = useState('');

  // Reset Forgotten Password state
  const [resetEmail, setResetEmail] = useState(() => searchParams.get('email') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const matchedUser = resetEmail.trim() ? findRegisteredUser(resetEmail.trim()) : null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim().toLowerCase();
    const existing = findRegisteredUser(cleanEmail);
    if (existing) {
      setErrorMsg(
        `An account with email "${cleanEmail}" is already registered. If you forgot your password, you can reset it below.`
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    const selectedDept = mockDepartments.find(d => d.id === departmentId);

    const payload: RegisterDetails = {
      fullName,
      email: cleanEmail,
      phone,
      password,
      role: selectedRole,
      departmentId,
      departmentName: selectedDept?.name,
      specialization: specialization || (selectedRole === 'doctor' ? `${selectedDept?.name} Specialist` : undefined),
      shift,
      gender,
      bloodGroup,
      address,
    };

    setIsLoading(true);
    const success = await registerUser(payload);
    setIsLoading(false);

    if (success) {
      navigate('/');
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanResetEmail = resetEmail.trim().toLowerCase();
    if (!cleanResetEmail) {
      setErrorMsg('Please enter your registered email address');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    const success = await updatePassword(cleanResetEmail, newPassword);
    setIsLoading(false);

    if (success) {
      setResetSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-xl shadow-sky-600/30">
            <HeartPulse className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Medi<span className="text-sky-600">Care</span> Systems
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {activeTab === 'register'
              ? 'Create an authorized healthcare account or reset existing credentials'
              : 'Recover and update your account password'}
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Tab Segment Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
                setResetSuccess(false);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('resetPassword');
                setErrorMsg('');
                setResetSuccess(false);
                if (email && !resetEmail) {
                  setResetEmail(email);
                }
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'resetPassword'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              Forgot Password / Reset
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              {errorMsg.includes('already registered') && (
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setActiveTab('resetPassword');
                    setErrorMsg('');
                  }}
                  className="font-bold underline text-sky-700 dark:text-sky-400 block hover:opacity-80"
                >
                  Click here to edit/reset password for {email} →
                </button>
              )}
            </div>
          )}

          {activeTab === 'resetPassword' ? (
            /* RESET FORGOTTEN PASSWORD MODE */
            resetSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Password Updated Successfully!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Your new password is now active. You can log into your MediCare healthcare portal immediately.
                </p>
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <Button
                    variant="primary"
                    onClick={() => navigate('/login')}
                    className="w-full sm:w-auto px-6 py-2.5"
                  >
                    Proceed to Sign In
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResetSuccess(false);
                      setActiveTab('register');
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}
                    className="w-full sm:w-auto px-6 py-2.5"
                  >
                    Back to Register
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
                <div className="p-3 bg-sky-50 dark:bg-sky-950/30 rounded-xl border border-sky-100 dark:border-sky-900/60 text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-sky-900 dark:text-sky-300 flex items-center gap-1.5 mb-1">
                    <KeyRound className="w-4 h-4 text-sky-600" />
                    Reset Forgotten Password
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Enter the email address of your registered account and choose a new secure password.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="e.g. doctor@medicare.health"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
                    />
                  </div>

                  {matchedUser && (
                    <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Account verified: <strong className="font-semibold">{matchedUser.fullName}</strong> ({matchedUser.role.toUpperCase()})
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.5 rounded font-mono">
                        Active
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-2.5 mt-2"
                  isLoading={isLoading}
                  leftIcon={<KeyRound className="w-4 h-4" />}
                >
                  Save & Update Password
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('register');
                      setErrorMsg('');
                    }}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Account Registration
                  </button>
                </div>
              </form>
            )
          ) : (
            /* CREATE ACCOUNT MODE */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Select Your Hospital Role *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {ROLE_OPTIONS.map(opt => {
                    const isSelected = selectedRole === opt.role;
                    return (
                      <button
                        key={opt.role}
                        type="button"
                        onClick={() => setSelectedRole(opt.role)}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 dark:border-sky-500 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-xs">
                            {opt.icon}
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          )}
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                          {opt.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Standard Identity Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Full Legal Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Dr. Arthur Pendelton"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@medicare.health"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
                  />
                </div>
              </div>

              {/* Role-Specific Fields */}
              {(selectedRole === 'doctor' || selectedRole === 'nurse') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Assigned Department
                    </label>
                    <select
                      value={departmentId}
                      onChange={e => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
                    >
                      {mockDepartments.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedRole === 'doctor' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Clinical Specialization
                      </label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={e => setSpecialization(e.target.value)}
                        placeholder="e.g. Interventional Cardiology"
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Duty Shift
                      </label>
                      <select
                        value={shift}
                        onChange={e => setShift(e.target.value as any)}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
                      >
                        <option value="morning">Morning Shift (07:00 - 15:00)</option>
                        <option value="evening">Evening Shift (15:00 - 23:00)</option>
                        <option value="night">Night Shift (23:00 - 07:00)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {selectedRole === 'receptionist' && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Front Desk Shift
                  </label>
                  <select
                    value={shift}
                    onChange={e => setShift(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
                  >
                    <option value="morning">Morning Shift (08:00 - 16:00)</option>
                    <option value="evening">Evening Shift (16:00 - 00:00)</option>
                    <option value="night">Night Shift (00:00 - 08:00)</option>
                  </select>
                </div>
              )}

              {selectedRole === 'patient' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Blood Group
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg dark:text-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Create Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Forgot password quick toggle */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('resetPassword');
                    setErrorMsg('');
                    if (email) setResetEmail(email);
                  }}
                  className="text-xs text-sky-600 hover:text-sky-700 dark:text-sky-400 font-medium"
                >
                  Forgot your password for an existing account? Reset here
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 mt-2"
                isLoading={isLoading}
              >
                Complete Registration as {selectedRole.toUpperCase()}
              </Button>
            </form>
          )}

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Already have an authorized account? </span>
            <Link to="/login" className="text-sky-600 hover:text-sky-700 font-semibold">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
