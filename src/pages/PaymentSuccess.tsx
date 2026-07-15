import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, LayoutDashboard } from 'lucide-react';
import { UIDLogo } from '../components/UIDLogo';
import { verifyPayment, activateMembership, type PlanId } from '../services/stripe';
import { useAuth } from '../context/AuthContext';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const sessionId = params.get('session_id') || '';
  const plan = (params.get('plan') as PlanId) || 'monthly';

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    (async () => {
      const { paid } = await verifyPayment(sessionId);
      if (!paid) {
        navigate('/payment-cancelled');
        return;
      }
      await activateMembership(plan);
      const renewalDate = plan === 'annual'
        ? new Date(Date.now() + 365 * 86400000).toISOString()
        : new Date(Date.now() + 30 * 86400000).toISOString();
      await updateProfile({ membership_status: 'active', renewal_date: renewalDate });
      // Auto-redirect to dashboard after 3 seconds
      timer = setTimeout(() => navigate('/dashboard'), 3000);
    })();
    return () => clearTimeout(timer);
  }, [sessionId, plan, navigate, updateProfile]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(165deg, #F0F9FF 0%, #EAF5F5 35%, #F7FAFC 65%, #FFFFFF 100%)', position: 'relative', overflow: 'hidden', padding: '2rem' }}>
      <div className="ottoman-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,200,200,0.14), transparent 70%)', animation: 'floatOrb 9s ease-in-out infinite', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '500px' }}>
        <Link to="/" style={{ display: 'inline-flex', marginBottom: '2rem' }}>
          <UIDLogo width={140} />
        </Link>

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }} style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem', boxShadow: '0 12px 40px rgba(62,200,200,0.35)' }}>
          <CheckCircle2 size={44} color="#fff" />
        </motion.div>

        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600, marginBottom: '0.75rem', fontFamily: "'DM Sans', sans-serif" }}>
          Payment Successful
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '36px', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 1rem', lineHeight: 1.2 }}>
          <em>Welcome to UID Toronto{user?.first_name ? `, ${user.first_name}` : ''}!</em>
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-mid)', fontWeight: 300, lineHeight: 1.7, margin: '0 0 1rem', fontFamily: "'DM Sans', sans-serif" }}>
          Your membership has been activated successfully. You now have full access to all member benefits.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-soft)', fontWeight: 300, margin: '0 0 2.5rem', fontFamily: "'DM Sans', sans-serif" }}>
          Redirecting you to your dashboard…
        </p>

        {/* Button */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" className="shimmer-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '99px', fontSize: '15px', fontWeight: 500, background: 'linear-gradient(135deg, #0D4D7C, #1A6A9A)', color: '#fff', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'transform 0.3s, box-shadow 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(13,77,124,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
            <LayoutDashboard size={17} />
            Go to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
