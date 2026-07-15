import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const { forgotPassword, isPending, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setEmailError(null);
    if (!email.trim()) { setEmailError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Please enter a valid email'); return; }
    if (error) clearError();
    const { error: err } = await forgotPassword(email);
    if (!err) setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout title="Check Your Email" subtitle="Password reset instructions are on the way." footer={<Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--uid-teal-dark)', fontWeight: 500, textDecoration: 'none' }}><ArrowLeft size={14} /> Back to login</Link>}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{ textAlign: 'center', padding: '1rem 0' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }} style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 12px 40px rgba(62,200,200,0.3)' }}>
            <CheckCircle2 size={32} color="#fff" />
          </motion.div>
          <p style={{ fontSize: '14.5px', color: 'var(--text-mid)', fontWeight: 300, lineHeight: 1.7, margin: '0 0 0.5rem' }}>
            We've sent a password reset link to
          </p>
          <p style={{ fontSize: '15px', color: 'var(--uid-navy)', fontWeight: 500, margin: '0 0 1.5rem', fontFamily: "'DM Sans', sans-serif" }}>
            {email}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-soft)', fontWeight: 300, lineHeight: 1.6, margin: 0 }}>
            Didn't receive the email? Check your spam folder or try again in a few minutes.
          </p>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--uid-teal-dark)', fontWeight: 500, textDecoration: 'none' }}><ArrowLeft size={14} /> Back to login</Link>}
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div style={{ padding: '10px 14px', fontSize: '13px', color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', marginBottom: '1rem', fontFamily: "'DM Sans', sans-serif" }}>
            {error}
          </div>
        )}
        <AuthInput id="email" label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={v => { setEmail(v); if (emailError) setEmailError(null); if (error) clearError(); }} error={emailError || undefined} icon={<Mail size={16} />} disabled={isPending} autoComplete="email" />
        <AuthButton type="submit" loading={isPending}>
          {isPending ? 'Sending…' : 'Send Reset Link'}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}
