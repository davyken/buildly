import React from 'react';
import { clsx } from 'clsx';

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline' | 'accent';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'ghost', size = 'md', loading, icon, children, className, disabled, ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-body font-medium rounded-lg transition-all duration-150 select-none cursor-pointer';
  const variants = {
    primary: 'bg-white text-black hover:bg-zinc-100 active:scale-95',
    accent: 'bg-accent text-black hover:bg-accent-dim active:scale-95 font-semibold',
    ghost: 'text-text-dim hover:text-text hover:bg-white/5 active:bg-white/10',
    outline: 'border border-border text-text-dim hover:border-zinc-600 hover:text-text',
    danger: 'text-red-400 hover:bg-red-500/10 hover:text-red-300',
  };
  const sizes = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-5 py-2.5',
  };
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(base, variants[variant], sizes[size], (disabled || loading) && 'opacity-40 cursor-not-allowed', className)}
    >
      {loading ? <Spinner size={14} /> : icon}
      {children}
    </button>
  );
};

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs font-medium text-text-dim uppercase tracking-wider">{label}</label>}
    <input
      {...props}
      className={clsx(
        'w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-muted outline-none',
        'focus:border-accent/60 focus:ring-1 focus:ring-accent/20 transition-colors',
        error && 'border-red-500/50',
        className,
      )}
    />
    {error && <span className="text-xs text-red-400">{error}</span>}
  </div>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: number; className?: string }> = ({ size = 16, className }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    className={clsx('animate-spin', className)}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'green' | 'yellow' | 'red' | 'default' }> = ({
  children, variant = 'default',
}) => {
  const colors = {
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    red: 'bg-red-500/15 text-red-400 border-red-500/20',
    default: 'bg-white/5 text-text-dim border-border',
  };
  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium', colors[variant])}>
      {children}
    </span>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string;
}
export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, width = 'max-w-md' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-panel border border-border rounded-2xl shadow-panel w-full animate-pop', width)}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h3 className="font-display font-semibold text-text">{title}</h3>
            <button onClick={onClose} className="text-muted hover:text-text transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ── Tooltip ───────────────────────────────────────────────────────────────────
export const Tooltip: React.FC<{ label: string; children: React.ReactNode; side?: 'top' | 'right' | 'bottom' }> = ({
  label, children, side = 'bottom',
}) => {
  const [show, setShow] = React.useState(false);
  const positions = { top: 'bottom-full mb-2 left-1/2 -translate-x-1/2', right: 'left-full ml-2 top-1/2 -translate-y-1/2', bottom: 'top-full mt-2 left-1/2 -translate-x-1/2' };
  return (
    <div className="relative inline-flex" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className={clsx('absolute z-50 px-2 py-1 bg-zinc-800 border border-border rounded text-xs text-text-dim whitespace-nowrap pointer-events-none animate-fade-in', positions[side])}>
          {label}
        </div>
      )}
    </div>
  );
};

// ── Card ─────────────────────────────────────────────────────────────────────
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={clsx('rounded-2xl', className)} {...props}>{children}</div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={clsx('px-6 pt-6', className)} {...props}>{children}</div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => (
  <h3 className={clsx('font-display font-semibold text-text', className)} {...props}>{children}</h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={clsx('px-6 pb-6', className)} {...props}>{children}</div>
);

// ── ColorPicker ───────────────────────────────────────────────────────────────
const PRESETS = ['#ffffff','#000000','#f8f9fa','#e9ecef','#111827','#1f2937','#374151','#6ee7b7','#34d399','#6366f1','#8b5cf6','#ec4899','#f59e0b','#ef4444','#3b82f6','#06b6d4','transparent'];

export const ColorPicker: React.FC<{ value: string; onChange: (v: string) => void; label?: string }> = ({ value, onChange, label }) => (
  <div className="flex flex-col gap-2">
    {label && <label className="text-xs font-medium text-text-dim uppercase tracking-wider">{label}</label>}
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8 rounded-md border border-border overflow-hidden flex-shrink-0">
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\'%3E%3Crect width=\'4\' height=\'4\' fill=\'%23ccc\'/%3E%3Crect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'%23ccc\'/%3E%3C/svg%3E")' }} />
        <div className="absolute inset-0 rounded-md" style={{ background: value === 'transparent' ? 'transparent' : value }} />
        <input type="color" value={value === 'transparent' ? '#ffffff' : value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
      </div>
      <input
        type="text" value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-surface border border-border rounded-lg px-2 py-1.5 text-xs font-mono text-text outline-none focus:border-accent/60"
      />
    </div>
    <div className="flex flex-wrap gap-1.5">
      {PRESETS.map((c) => (
        <button key={c} onClick={() => onChange(c)} title={c}
          className={clsx('w-5 h-5 rounded border transition-all hover:scale-110', value === c ? 'border-accent scale-110' : 'border-border')}
          style={{ background: c === 'transparent' ? 'transparent' : c, backgroundImage: c === 'transparent' ? 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'8\' height=\'8\'%3E%3Crect width=\'4\' height=\'4\' fill=\'%23ccc\'/%3E%3Crect x=\'4\' y=\'4\' width=\'4\' height=\'4\' fill=\'%23ccc\'/%3E%3C/svg%3E")' : 'none' }}
        />
      ))}
    </div>
  </div>
);
