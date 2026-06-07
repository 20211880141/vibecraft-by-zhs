import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-900',
        variant === 'primary' &&
          'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 active:bg-emerald-700',
        variant === 'secondary' &&
          'border border-gray-200/60 bg-white/70 text-gray-700 shadow-sm backdrop-blur-sm hover:bg-gray-100 active:bg-gray-200 dark:border-gray-700/50 dark:bg-gray-800/60 dark:text-gray-200 dark:hover:bg-gray-700',
        variant === 'ghost' &&
          'text-gray-500 hover:bg-gray-100/50 active:bg-gray-200/50 dark:text-gray-400 dark:hover:bg-gray-800/50',
        size === 'sm' && 'h-9 gap-1.5 px-3 text-sm',
        size === 'md' && 'h-12 gap-2 px-5 text-sm',
        size === 'lg' && 'h-14 gap-2.5 px-7 text-base',
        disabled && 'pointer-events-none',
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}