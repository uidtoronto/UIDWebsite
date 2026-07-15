import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { signupSchema, type SignupValues } from '../../lib/validation';

export default function AdminSignup() {
  const { signUp, isPending, error, clearError } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { first_name: '', last_name: '', email: '', password: '' },
  });

  const onSubmit = async (values: SignupValues) => {
    if (error) clearError();
    const { error: err } = await signUp({
      first_name: values.first_name,
      last_name: values.last_name,
      username: values.email.split('@')[0],
      email: values.email,
      password: values.password,
    });
    if (err) {
      toast(err, 'error');
    } else {
      toast('Account created — welcome aboard', 'success');
      navigate('/admin');
    }
  };

  const field = (name: keyof SignupValues) => ({
    border: errors[name] ? '1.5px solid rgba(220,38,38,0.4)' : '1.5px solid rgba(13,77,124,0.15)',
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(165deg, #F0F9FF 0%, #EAF5F5 35%, #F7FAFC 65%, #FFFFFF 100%)' }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex" style={{ flex: '1 1 45%', background: 'linear-gradient(160deg, #0D4D7C 0%, #061E30 100%)', position: 'relative', overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', padding: '3rem 3.5rem' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 20%, rgba(62,200,200,0.18), transparent 50%), radial-gradient(circle at 20% 80%, rgba(26,106,154,0.25), transparent 45%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ position: 'relative', zIndex: 1, maxWidth: 420 }}>
          <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600, marginBottom: '1.5rem' }}>
            UID Toronto · Admin
          </p>
          <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 400, color: '#fff', lineHeight: 1.15 }}>
            <em>Join the admin team.</em>
          </h1>
          <p style={{ margin: '1.5rem 0 0', fontFamily: "'DM Sans', sans-serif", fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontWeight: 300 }}>
            Create your account to manage members, track status, and grow your community.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2rem', color: 'rgba(255,255,255,0.5)', fontSize: '12.5px', fontFamily: "'DM Sans', sans-serif" }}>
            <ShieldCheck size={15} style={{ color: 'var(--uid-teal)' }} />
            Secure access · Supabase Auth
          </div>
        </motion.div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: '1 1 55%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 420 }}>
          <div className="lg:hidden" style={{ marginBottom: '1.5rem' }}>
            <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal-dark)', fontWeight: 600 }}>UID Toronto · Admin</p>
          </div>

          <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '34px', fontWeight: 400, color: 'var(--uid-navy)' }}>
            <em>Create account</em>
          </h2>
          <p style={{ margin: '0.5rem 0 2rem', fontFamily: "'DM Sans', sans-serif", fontSize: '14.5px', color: 'var(--text-mid)' }}>
            Sign up to start managing members.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {error && (
              <div style={{ padding: '10px 14px', fontSize: '13px', color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '10px', marginBottom: '1rem', fontFamily: "'DM Sans', sans-serif" }}>
                {error}
              </div>
            )}

            {/* Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="admin-auth-grid">
              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 600, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>First name</span>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', pointerEvents: 'none' }} />
                  <input
                    className="admin-input"
                    placeholder="John"
                    autoComplete="given-name"
                    disabled={isPending}
                    style={{ width: '100%', padding: '0.7rem 0.875rem 0.7rem 2.5rem', borderRadius: '10px', ...field('first_name'), fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--uid-dark)', background: '#fff', outline: 'none', transition: 'border-color 0.2s' }}
                    {...register('first_name')}
                  />
                </div>
                {errors.first_name && <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '12px', color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>{errors.first_name.message}</span>}
              </label>

              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 600, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>Last name</span>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', pointerEvents: 'none' }} />
                  <input
                    className="admin-input"
                    placeholder="Doe"
                    autoComplete="family-name"
                    disabled={isPending}
                    style={{ width: '100%', padding: '0.7rem 0.875rem 0.7rem 2.5rem', borderRadius: '10px', ...field('last_name'), fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--uid-dark)', background: '#fff', outline: 'none', transition: 'border-color 0.2s' }}
                    {...register('last_name')}
                  />
                </div>
                {errors.last_name && <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '12px', color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>{errors.last_name.message}</span>}
              </label>
            </div>

            {/* Email */}
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 600, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>Email</span>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', pointerEvents: 'none' }} />
                <input
                  className="admin-input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isPending}
                  style={{ width: '100%', padding: '0.7rem 0.875rem 0.7rem 2.5rem', borderRadius: '10px', ...field('email'), fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--uid-dark)', background: '#fff', outline: 'none', transition: 'border-color 0.2s' }}
                  {...register('email')}
                />
              </div>
              {errors.email && <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '12px', color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>{errors.email.message}</span>}
            </label>

            {/* Password */}
            <label style={{ display: 'block', marginBottom: '1.75rem' }}>
              <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: '12.5px', fontWeight: 600, color: 'var(--text-mid)', marginBottom: '0.375rem' }}>Password</span>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-soft)', pointerEvents: 'none' }} />
                <input
                  className="admin-input"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  disabled={isPending}
                  style={{ width: '100%', padding: '0.7rem 0.875rem 0.7rem 2.5rem', borderRadius: '10px', ...field('password'), fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--uid-dark)', background: '#fff', outline: 'none', transition: 'border-color 0.2s' }}
                  {...register('password')}
                />
              </div>
              {errors.password && <span style={{ display: 'block', marginTop: '0.25rem', fontSize: '12px', color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>{errors.password.message}</span>}
            </label>

            <button
              type="submit"
              disabled={isPending}
              style={{
                width: '100%', padding: '0.8rem', borderRadius: '10px',
                border: 'none', cursor: isPending ? 'wait' : 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: '14.5px', fontWeight: 600,
                background: 'linear-gradient(135deg, var(--uid-navy), var(--uid-mid))',
                color: '#fff', opacity: isPending ? 0.7 : 1,
                boxShadow: '0 8px 24px rgba(13,77,124,0.25)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { if (!isPending) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(13,77,124,0.35)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,77,124,0.25)'; }}
            >
              {isPending ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={{ margin: '1.5rem 0 0', textAlign: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: '13.5px', color: 'var(--text-mid)' }}>
            Already have an account?{' '}
            <Link to="/admin/login" style={{ color: 'var(--uid-teal-dark)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>

          <style>{`@media (max-width: 480px) { .admin-auth-grid { grid-template-columns: 1fr !important; } }`}</style>
        </motion.div>
      </div>
    </div>
  );
}
