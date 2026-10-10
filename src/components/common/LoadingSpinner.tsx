import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading healthcare records...',
  size = 'md',
  fullScreen = false,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <Loader2 className={`${sizeMap[size]} text-sky-600 animate-spin`} />
      {label && <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        {content}
      </div>
    );
  }

  return content;
};
