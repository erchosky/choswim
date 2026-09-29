import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from './utils';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide text-app-muted', className)} />;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(props, ref) {
  return <input ref={ref} {...props} className={cn('min-h-11 w-full rounded-lg border border-app-line bg-app-bg/70 px-3 text-sm text-app-text outline-hidden transition placeholder:text-app-muted/55 focus:border-app-accent', props.className)} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(props, ref) {
  return <select ref={ref} {...props} className={cn('min-h-11 w-full rounded-lg border border-app-line bg-app-bg/70 px-3 text-sm text-app-text outline-hidden transition focus:border-app-accent', props.className)} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(props, ref) {
  return <textarea ref={ref} {...props} className={cn('min-h-28 w-full rounded-lg border border-app-line bg-app-bg/70 px-3 py-3 text-sm text-app-text outline-hidden transition placeholder:text-app-muted/55 focus:border-app-accent', props.className)} />;
});

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-app-danger" role="alert">{message}</p>;
}
