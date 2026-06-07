import { cn } from '@/lib/cn';

interface BadgeProps {
  children: string;
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

const variants = {
  default:
    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  primary:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  secondary:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}