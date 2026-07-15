import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, type, message }]);
    // auto-dismiss after 4s
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast viewport — fixed top-right, stacked */}
      <div style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        pointerEvents: 'none',
        maxWidth: '380px',
        width: 'calc(100% - 3rem)',
      }}>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Single toast entry ──
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const palette = {
    success: { icon: CheckCircle2, color: '#16a34a', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.25)' },
    error:   { icon: XCircle,      color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.25)' },
    info:    { icon: Info,         color: '#0D4D7C', bg: 'rgba(13,77,124,0.08)', border: 'rgba(13,77,124,0.25)' },
  }[toast.type];

  const Icon = palette.icon;

  return (
    <div
      role="alert"
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.625rem',
        padding: '0.875rem 1rem',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 12px 32px rgba(13,77,124,0.18)',
        border: `1px solid ${palette.border}`,
        animation: 'toastIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '1px', color: palette.color, background: palette.bg, borderRadius: '8px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} />
      </div>
      <p style={{ flex: 1, margin: 0, fontSize: '13.5px', lineHeight: 1.5, color: 'var(--uid-dark)', fontWeight: 400 }}>
        {toast.message}
      </p>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', padding: 0, display: 'flex', marginTop: '1px' }}
      >
        <X size={15} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
