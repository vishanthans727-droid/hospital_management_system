import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Activity,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Pill,
  BedDouble,
  CreditCard,
  FlaskConical,
  Package,
  BarChart3,
  ShieldCheck,
  LayoutDashboard,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../common/Badge';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, role, switchDemoRole } = useAuth();

  interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
    roles: UserRole[];
    badge?: string;
  }

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['administrator', 'doctor', 'nurse', 'receptionist', 'patient'],
    },
    {
      name: 'Patients',
      path: '/patients',
      icon: <Users className="w-5 h-5" />,
      roles: ['administrator', 'doctor', 'nurse', 'receptionist'],
    },
    {
      name: 'Doctors & Staff',
      path: '/staff',
      icon: <UserCheck className="w-5 h-5" />,
      roles: ['administrator'],
    },
    {
      name: 'Appointments',
      path: '/appointments',
      icon: <Calendar className="w-5 h-5" />,
      roles: ['administrator', 'doctor', 'receptionist', 'patient'],
    },
    {
      name: 'Medical Records',
      path: '/emr',
      icon: <FileText className="w-5 h-5" />,
      roles: ['administrator', 'doctor', 'nurse', 'patient'],
    },
    {
      name: 'Prescriptions',
      path: '/prescriptions',
      icon: <Pill className="w-5 h-5" />,
      roles: ['administrator', 'doctor', 'nurse', 'patient'],
    },
    {
      name: 'Wards & Beds',
      path: '/admissions',
      icon: <BedDouble className="w-5 h-5" />,
      roles: ['administrator', 'doctor', 'nurse', 'receptionist'],
      badge: 'Live',
    },
    {
      name: 'Billing & Invoices',
      path: '/billing',
      icon: <CreditCard className="w-5 h-5" />,
      roles: ['administrator', 'receptionist', 'patient'],
    },
    {
      name: 'Laboratory',
      path: '/laboratory',
      icon: <FlaskConical className="w-5 h-5" />,
      roles: ['administrator', 'doctor', 'nurse'],
    },
    {
      name: 'Pharmacy & Stock',
      path: '/pharmacy',
      icon: <Package className="w-5 h-5" />,
      roles: ['administrator', 'doctor', 'nurse'],
    },
    {
      name: 'Reports & Export',
      path: '/reports',
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['administrator'],
    },
    {
      name: 'Audit Trail',
      path: '/audit-logs',
      icon: <ShieldCheck className="w-5 h-5" />,
      roles: ['administrator'],
    },
  ];

  const filteredNavItems = navItems.filter(item =>
    role ? item.roles.includes(role) : false
  );

  return (
    <aside
      className={cn(
        'fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                Medi<span className="text-sky-600">Care</span>
              </span>
              <span className="text-[10px] font-semibold uppercase bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Hospital Management</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {filteredNavItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              )
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <Badge variant="primary" size="sm">
                {item.badge}
              </Badge>
            )}
          </NavLink>
        ))}
      </div>

      {/* Role Switcher for Testing */}
      <div className="p-3 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            Switch Demo Role
          </span>
          <span className="text-[10px] uppercase font-bold text-sky-600 bg-sky-100 dark:bg-sky-950 px-1.5 py-0.2 rounded">
            {role}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {(['administrator', 'doctor', 'nurse', 'receptionist', 'patient'] as UserRole[]).map(r => (
            <button
              key={r}
              onClick={() => switchDemoRole(r)}
              className={cn(
                'px-2 py-1 rounded text-[11px] font-medium capitalize text-left transition-colors truncate',
                role === r
                  ? 'bg-sky-600 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
