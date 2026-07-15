import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import type { MemberStatus } from '../../types';
import { statusStyle } from '../../lib/memberUtils';

// Shared text/select input styling for admin forms — matches the brand.
const baseField: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  borderRadius: '10px',
  border: '1.5px solid rgba(13,77,124,0.15)',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  color: 'var(--uid-dark)',
  background: '#fff',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  outline: 'none',
};

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, hint, ...rest }, ref) => (
    <label style={{ display: 'block', marginBottom: '1rem' }}>
      <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 600, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>
        {label}
      </span>
      <input
        ref={ref}
        style={{
          ...baseField,
          borderColor: error ? 'rgba(220,38,38,0.4)' : baseField.borderColor,
        }}
        {...rest}
      />
      {error ? (
        <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '12px', color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>{error}</span>
      ) : hint ? (
        <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '12px', color: 'var(--text-soft)', fontFamily: "'DM Sans', sans-serif" }}>{hint}</span>
      ) : null}
    </label>
  ),
);
TextField.displayName = 'TextField';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, children, ...rest }, ref) => (
    <label style={{ display: 'block', marginBottom: '1rem' }}>
      <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 600, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>
        {label}
      </span>
      <select
        ref={ref}
        style={{
          ...baseField,
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A9BB5' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          paddingRight: '2rem',
          borderColor: error ? 'rgba(220,38,38,0.4)' : baseField.borderColor,
        }}
        {...rest}
      >
        {children}
      </select>
      {error && <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '12px', color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>{error}</span>}
    </label>
  ),
);
SelectField.displayName = 'SelectField';

// ── Status badge ──
export function StatusBadge({ status }: { status: MemberStatus }) {
  const s = statusStyle(status);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '3px 10px', borderRadius: '99px',
      background: s.bg, color: s.text,
      fontFamily: "'DM Sans', sans-serif", fontSize: '11.5px', fontWeight: 600,
    }}>
      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}
