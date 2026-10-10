import React from 'react';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
      <div className="p-4 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mb-4">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100">
        {title}
      </h4>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
