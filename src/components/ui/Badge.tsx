import type { HTMLAttributes } from 'react';
import { cn } from './utils';

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn('inline-flex items-center rounded-md border border-app-line bg-app-surface/70 px-2 py-1 text-xs font-semibold text-app-text', className)} {...props} />;
}
