interface PasswordStrengthProps {
  password: string;
}

interface StrengthInfo {
  score: number; // 0-4
  label: string;
  color: string;
  pct: number;
}

function evaluate(pw: string): StrengthInfo {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  score = Math.min(score, 4);

  const map: Record<number, StrengthInfo> = {
    0: { score: 0, label: 'Too short', color: '#e5e7eb', pct: 0 },
    1: { score: 1, label: 'Weak', color: '#ef4444', pct: 25 },
    2: { score: 2, label: 'Fair', color: '#f59e0b', pct: 50 },
    3: { score: 3, label: 'Good', color: '#22c55e', pct: 75 },
    4: { score: 4, label: 'Strong', color: 'var(--uid-teal)', pct: 100 },
  };

  return map[score];
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;
  const info = evaluate(password);

  return (
    <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '99px',
              background: i < info.score ? info.color : '#e5e7eb',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: '11px', color: 'var(--text-soft)', fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
        Password strength: <span style={{ color: info.color === 'var(--uid-teal)' ? 'var(--uid-teal-dark)' : info.color, fontWeight: 500 }}>{info.label}</span>
      </p>
    </div>
  );
}
