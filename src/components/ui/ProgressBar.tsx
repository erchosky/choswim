export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-app-muted">
        <span>{label}</span>
        <span>{clamped}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-app-bg">
        <div className="h-full rounded-full bg-gradient-to-r from-app-accent to-app-good" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
