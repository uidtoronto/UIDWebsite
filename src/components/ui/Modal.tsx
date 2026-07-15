import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
}

// Accessible-ish modal: locks body scroll, closes on backdrop click + Esc.
export default function Modal({ open, title, onClose, children, maxWidth = 560 }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(6,30,48,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'modalBackdropIn 0.2s ease forwards',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          width: '100%',
          maxWidth,
          background: '#fff',
          borderRadius: '18px',
          boxShadow: '0 24px 64px rgba(6,30,48,0.3)',
          overflow: 'hidden',
          animation: 'modalPanelIn 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.125rem 1.5rem',
          borderBottom: '1px solid rgba(13,77,124,0.08)',
          flexShrink: 0,
        }}>
          <h3 style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '17px', fontWeight: 600, color: 'var(--uid-navy)' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(13,77,124,0.06)', border: 'none', cursor: 'pointer',
              width: '32px', height: '32px', borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-mid)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,77,124,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13,77,124,0.06)'; }}
          >
            <X size={18} />
          </button>
        </div>
        {/* Body — scrollable */}
        <div style={{ overflow: 'auto', padding: '1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
