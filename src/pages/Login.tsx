import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isPending, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLocalError(null);
    if (!emailOrUsername.trim()) { setLocalError('Please enter your email or username'); return; }
    if (!password) { setLocalError('Please enter your password'); return; }
    if (error) clearError();
    const { error: err, user } = await login({ emailOrUsername, password, remember });
    if (!err) {
      // Redirect based on membership status
      if (user?.membership_status === 'active') navigate('/dashboard');
      else navigate('/membership');
    }
  };

  const displayError = localError || error;

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your UID Toronto member dashboard."
      footer={<>Don't have an account? <Link to="/signup" style={{ color: 'var(--uid-teal-dark)', fontWeight: 500, textDecoration: 'none' }}>Create one</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate>
        {displayError && (
          <div style={{ padding: '10px 14px', fontSize: '13px', color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', marginBottom: '1rem', fontFamily: "'DM Sans', sans-serif" }}>
            {displayError}
          </div>
        )}

        <AuthInput
          id="emailOrUsername"
          label="Email or Username"
          placeholder="you@example.com"
          value={emailOrUsername}
          onChange={v => { setEmailOrUsername(v); if (localError) setLocalError(null); if (error) clearError(); }}
          icon={<Mail size={16} />}
          disabled={isPending}
          autoComplete="username"
        />
        <AuthInput
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={v => { setPassword(v); if (localError) setLocalError(null); if (error) clearError(); }}
          icon={<Lock size={16} />}
          disabled={isPending}
          autoComplete="current-password"
        />

        {/* Remember + Forgot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <label htmlFor="remember" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-mid)', fontFamily: "'DM Sans', sans-serif" }}>
            <input
              id="remember"
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{
                appearance: 'none',
                width: '18px', height: '18px', borderRadius: '5px',
                border: '1.5px solid rgba(13,77,124,0.2)',
                background: remember ? 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))' : '#fff',
                cursor: 'pointer', flexShrink: 0,
                transition: 'background 0.2s',
              }}
            />
            Remember me
          </label>
          <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--uid-teal-dark)', fontWeight: 500, textDecoration: 'none' }}>
            Forgot password?
          </Link>
        </div>

        <AuthButton type="submit" loading={isPending}>
          {isPending ? 'Signing in…' : 'Sign In'}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}
