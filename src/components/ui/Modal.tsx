import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-app-bg/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg border border-app-line bg-app-panel p-4 shadow-glow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-app-text">{title}</h2>
          <Button variant="ghost" className="h-10 w-10 p-0" onClick={onClose} aria-label="Cerrar"><X size={18} /></Button>
        </div>
        {children}
      </div>
    </div>
  );
}
