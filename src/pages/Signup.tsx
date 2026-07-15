import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, AtSign, CheckCircle2, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import AuthButton from '../components/auth/AuthButton';
import PasswordStrength from '../components/auth/PasswordStrength';
import { useAuth } from '../context/AuthContext';

interface FormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  acceptPrivacy?: string;
}

const empty: FormData = {
  first_name: '', last_name: '', username: '', email: '', password: '', confirmPassword: '', acceptTerms: false, acceptPrivacy: false,
};

export default function Signup() {
  const { signUp, isPending, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(empty);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  const set = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (error) clearError();
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.first_name.trim()) e.first_name = 'First name is required';
    if (!form.last_name.trim()) e.last_name = 'Last name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Only letters, numbers and underscores';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) e.password = 'Must contain uppercase, lowercase and a number';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.acceptTerms) e.acceptTerms = 'You must accept the Terms & Conditions';
    if (!form.acceptPrivacy) e.acceptPrivacy = 'You must accept the Privacy Policy';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const { error: err } = await signUp({
      first_name: form.first_name,
      last_name: form.last_name,
      username: form.username,
      email: form.email,
      password: form.password,
    });
    if (!err) {
      setSuccess(true);
      setTimeout(() => navigate('/membership'), 2200);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(165deg, #F0F9FF 0%, #EAF5F5 35%, #F7FAFC 65%, #FFFFFF 100%)', padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: '420px' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }}
            style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 12px 40px rgba(62,200,200,0.35)' }}
          >
            <CheckCircle2 size={40} color="#fff" />
          </motion.div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 0.75rem' }}>
            <em>Welcome to UID Toronto!</em>
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-mid)', fontWeight: 300, lineHeight: 1.7, margin: '0 0 1.5rem' }}>
            Your account has been created successfully. Redirecting you to membership selection…
          </p>
          <div style={{ width: '180px', height: '3px', background: 'rgba(13,77,124,0.08)', borderRadius: '99px', margin: '0 auto', overflow: 'hidden' }}>
            <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 2, ease: 'easeInOut' }} style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, var(--uid-teal), var(--uid-mid))', borderRadius: '99px' }} />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the UID Toronto community and unlock member benefits."
      footer={<>Already have an account? <Link to="/login" style={{ color: 'var(--uid-teal-dark)', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div style={{ padding: '10px 14px', fontSize: '13px', color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', marginBottom: '1rem', fontFamily: "'DM Sans', sans-serif" }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <AuthInput id="first_name" label="First Name" placeholder="John" value={form.first_name} onChange={v => set('first_name', v)} error={errors.first_name} icon={<User size={16} />} disabled={isPending} autoComplete="given-name" />
          <AuthInput id="last_name" label="Last Name" placeholder="Doe" value={form.last_name} onChange={v => set('last_name', v)} error={errors.last_name} icon={<User size={16} />} disabled={isPending} autoComplete="family-name" />
        </div>

        <AuthInput id="username" label="Username" placeholder="johndoe" value={form.username} onChange={v => set('username', v)} error={errors.username} icon={<AtSign size={16} />} disabled={isPending} autoComplete="username" />
        <AuthInput id="email" label="Email Address" type="email" placeholder="john@example.com" value={form.email} onChange={v => set('email', v)} error={errors.email} icon={<Mail size={16} />} disabled={isPending} autoComplete="email" />
        <AuthInput id="password" label="Password" type="password" placeholder="Create a strong password" value={form.password} onChange={v => set('password', v)} error={errors.password} icon={<Lock size={16} />} disabled={isPending} autoComplete="new-password" />
        <PasswordStrength password={form.password} />
        <AuthInput id="confirmPassword" label="Confirm Password" type="password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={v => set('confirmPassword', v)} error={errors.confirmPassword} icon={<Lock size={16} />} disabled={isPending} autoComplete="new-password" />

        {/* Checkboxes */}
        <div style={{ marginBottom: '0.75rem' }}>
          <CheckboxRow id="acceptTerms" checked={form.acceptTerms} onChange={v => set('acceptTerms', v)} error={errors.acceptTerms} disabled={isPending}>
            I agree to the <a href="#" style={{ color: 'var(--uid-teal-dark)' }}>Terms & Conditions</a>
          </CheckboxRow>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <CheckboxRow id="acceptPrivacy" checked={form.acceptPrivacy} onChange={v => set('acceptPrivacy', v)} error={errors.acceptPrivacy} disabled={isPending}>
            I agree to the <a href="#" style={{ color: 'var(--uid-teal-dark)' }}>Privacy Policy</a>
          </CheckboxRow>
        </div>

        <AuthButton type="submit" loading={isPending}>
          {isPending ? 'Creating Account…' : 'Create Account'}
        </AuthButton>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1rem', color: 'var(--text-soft)', fontSize: '12px' }}>
          <ShieldCheck size={13} />
          <span>Your data is protected with industry-standard encryption</span>
        </div>
      </form>
    </AuthLayout>
  );
}

function CheckboxRow({ id, checked, onChange, error, disabled, children }: { id: string; checked: boolean; onChange: (v: boolean) => void; error?: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '13px', color: 'var(--text-mid)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={e => onChange(e.target.checked)}
          style={{
            appearance: 'none',
            width: '18px',
            height: '18px',
            borderRadius: '5px',
            border: `1.5px solid ${error ? 'rgba(220,38,38,0.5)' : 'rgba(13,77,124,0.2)'}`,
            background: checked ? 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))' : '#fff',
            cursor: 'pointer',
            flexShrink: 0,
            marginTop: '1px',
            position: 'relative',
            transition: 'background 0.2s, border-color 0.2s',
          }}
        />
        <span>{children}</span>
      </label>
      {error && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', marginLeft: '26px', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}
    </div>
  );
}
