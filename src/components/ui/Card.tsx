import type { HTMLAttributes } from 'react';
import { cn } from './utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border border-app-line bg-app-panel/92 p-4 shadow-xs', className)} {...props} />;
}
