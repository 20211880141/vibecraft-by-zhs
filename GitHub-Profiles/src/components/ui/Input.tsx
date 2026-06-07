import type { InputHTMLAttributes, ForwardedRef } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef(function Input(
  { className, label, id, ...props }: InputProps,
  ref: ForwardedRef<HTMLInputElement>,
) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={cn(
          'h-12 w-full rounded-xl border border-gray-200/60 bg-white/70 px-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm backdrop-blur-sm transition-all',
          'focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
          'dark:border-gray-700/50 dark:bg-gray-800/60 dark:text-gray-100 dark:placeholder-gray-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        {...props}
      />
    </div>
  );
});