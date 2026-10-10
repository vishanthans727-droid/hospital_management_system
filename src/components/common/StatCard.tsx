import React from 'react';
import { cn } from '../../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'blue' | 'teal' | 'emerald' | 'amber' | 'rose' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  onClick,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-sky-50 dark:bg-sky-950/40',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'hover:border-sky-300 dark:hover:border-sky-800',
    },
    teal: {
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      text: 'text-teal-600 dark:text-teal-400',
      border: 'hover:border-teal-300 dark:hover:border-teal-800',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-800',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-300 dark:hover:border-amber-800',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-300 dark:hover:border-rose-800',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-300 dark:hover:border-purple-800',
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card transition-all duration-200',
        onClick ? 'cursor-pointer hover:shadow-elevated' : '',
        scheme.border
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg shrink-0 flex items-center justify-center', scheme.bg, scheme.text)}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs">
          <span
            className={cn(
              'inline-flex items-center font-semibold mr-1.5',
              trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 mr-1 inline" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 mr-1 inline" />
            )}
            {Math.abs(trend.value)}%
          </span>
          <span className="text-slate-400 dark:text-slate-500">
            {trend.label || 'vs last month'}
          </span>
        </div>
      )}
    </div>
  );
};
