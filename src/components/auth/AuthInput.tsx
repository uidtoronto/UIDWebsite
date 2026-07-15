import { useState, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon?: ReactNode;
  disabled?: boolean;
  autoComplete?: string;
  rightSlot?: ReactNode;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 500,
  color: 'var(--uid-navy)',
  marginBottom: '6px',
  fontFamily: "'DM Sans', sans-serif",
};

export default function AuthInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled,
  autoComplete,
  rightSlot,
}: AuthInputProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', zIndex: 1 }}>
            {icon}
          </div>
        )}
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          style={{
            width: '100%',
            padding: '12px 14px',
            paddingLeft: icon ? '42px' : '14px',
            paddingRight: isPassword || rightSlot ? '40px' : '14px',
            fontSize: '14px',
            fontFamily: "'DM Sans', sans-serif",
            color: 'var(--uid-dark)',
            background: '#fff',
            border: `1.5px solid ${error ? 'rgba(220,38,38,0.45)' : 'rgba(13,77,124,0.16)'}`,
            borderRadius: '12px',
            outline: 'none',
            transition: 'border-color 0.25s, box-shadow 0.25s',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = error ? 'rgba(220,38,38,0.6)' : 'var(--uid-teal)'; e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'rgba(220,38,38,0.1)' : 'rgba(62,200,200,0.12)'}`; }}
          onBlur={e => { e.currentTarget.style.borderColor = error ? 'rgba(220,38,38,0.45)' : 'rgba(13,77,124,0.16)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            tabIndex={-1}
            aria-label={show ? 'Hide password' : 'Show password'}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', padding: 0 }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {rightSlot && !isPassword && (
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            {rightSlot}
          </div>
        )}
      </div>
      {error && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}
    </div>
  );
}
