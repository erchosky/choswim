import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: ReactNode;
}

export function Button({ className, variant = 'primary', icon, children, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-app-accent text-app-bg hover:brightness-110',
    secondary: 'bg-app-surface text-app-text border border-app-line hover:border-app-accent',
    ghost: 'bg-transparent text-app-muted hover:bg-app-surface/70',
    danger: 'bg-app-danger text-app-text hover:brightness-110'
  };
  return (
    <button
      className={cn('inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', variants[variant], className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
