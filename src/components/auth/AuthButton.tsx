import { type ReactNode, type ButtonHTMLAttributes } from 'react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'outline';
  children: ReactNode;
}

export default function AuthButton({ loading, variant = 'primary', children, disabled, ...rest }: AuthButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={isPrimary ? 'shimmer-btn' : ''}
      style={{
        width: '100%',
        padding: '14px',
        borderRadius: '99px',
        fontSize: '14.5px',
        fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif",
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        opacity: (disabled || loading) ? 0.7 : 1,
        background: isPrimary ? 'linear-gradient(135deg, #0D4D7C, #1A6A9A)' : 'rgba(255,255,255,0.75)',
        color: isPrimary ? '#fff' : 'var(--uid-navy)',
        border: isPrimary ? 'none' : '1.5px solid rgba(13,77,124,0.2)',
        transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s, color 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
      onMouseEnter={e => { if (!disabled && !loading) { e.currentTarget.style.transform = 'translateY(-2px)'; if (isPrimary) e.currentTarget.style.boxShadow = '0 12px 32px rgba(13,77,124,0.3)'; else { e.currentTarget.style.borderColor = 'var(--uid-teal)'; e.currentTarget.style.color = 'var(--uid-teal)'; } } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; if (!isPrimary) { e.currentTarget.style.borderColor = 'rgba(13,77,124,0.2)'; e.currentTarget.style.color = 'var(--uid-navy)'; } }}
    >
      {loading && (
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}
