import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import PasswordStrength from '../components/auth/PasswordStrength';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
  const { resetPassword, isPending, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setLocalError(null);
    if (!password) { setLocalError('Password is required'); return; }
    if (password.length < 8) { setLocalError('Password must be at least 8 characters'); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) { setLocalError('Must contain uppercase, lowercase and a number'); return; }
    if (password !== confirmPassword) { setLocalError('Passwords do not match'); return; }
    if (error) clearError();
    const { error: err } = await resetPassword(password);
    if (!err) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(165deg, #F0F9FF 0%, #EAF5F5 35%, #F7FAFC 65%, #FFFFFF 100%)', padding: '2rem' }}>
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ textAlign: 'center', maxWidth: '420px' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }} style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 12px 40px rgba(62,200,200,0.35)' }}>
            <CheckCircle2 size={40} color="#fff" />
          </motion.div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 0.75rem' }}>
            <em>Password Updated!</em>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-mid)', fontWeight: 300, lineHeight: 1.7, margin: '0 0 1.5rem' }}>
            Your password has been reset successfully. Redirecting you to login…
          </p>
          <div style={{ width: '180px', height: '3px', background: 'rgba(13,77,124,0.08)', borderRadius: '99px', margin: '0 auto', overflow: 'hidden' }}>
            <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 2.3, ease: 'easeInOut' }} style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, var(--uid-teal), var(--uid-mid))', borderRadius: '99px' }} />
          </div>
        </motion.div>
      </div>
    );
  }

  const displayError = localError || error;

  return (
    <AuthLayout title="Reset Password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} noValidate>
        {displayError && (
          <div style={{ padding: '10px 14px', fontSize: '13px', color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', marginBottom: '1rem', fontFamily: "'DM Sans', sans-serif" }}>
            {displayError}
          </div>
        )}
        <AuthInput id="password" label="New Password" type="password" placeholder="Create a strong password" value={password} onChange={v => { setPassword(v); if (localError) setLocalError(null); if (error) clearError(); }} error={undefined} icon={<Lock size={16} />} disabled={isPending} autoComplete="new-password" />
        <PasswordStrength password={password} />
        <AuthInput id="confirmPassword" label="Confirm Password" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={v => { setConfirmPassword(v); if (localError) setLocalError(null); if (error) clearError(); }} icon={<Lock size={16} />} disabled={isPending} autoComplete="new-password" />
        <AuthButton type="submit" loading={isPending}>
          {isPending ? 'Updating…' : 'Reset Password'}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}
