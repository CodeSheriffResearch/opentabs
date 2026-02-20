import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'primary' | 'outline' | 'link';
}

const sizeClasses = {
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
} as const;

const variantClasses = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  outline: 'bg-transparent text-foreground',
  link: 'bg-transparent text-primary hover:underline border-0 shadow-none',
} as const;

export function IconButton({ children, size = 'md', className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'font-head border-border border-2 shadow-md transition-all hover:shadow-xs',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
      {...props}>
      {children}
    </button>
  );
}
