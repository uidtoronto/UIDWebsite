import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, Calendar, TrendingDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UIDLogo } from '../components/UIDLogo';
import { PLANS, type PlanId, type PlanInfo, createCheckoutSession, redirectToCheckout } from '../services/stripe';
import { useAuth } from '../context/AuthContext';

export default function Membership() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null);

  // Redirect unauthenticated users to /signup
  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/signup');
  }, [isLoading, isAuthenticated, navigate]);

  const handleSelectPlan = async (planId: PlanId) => {
    setPendingPlan(planId);
    const { session, error } = await createCheckoutSession(planId);
    if (error || !session) {
      setPendingPlan(null);
      return;
    }
    await redirectToCheckout(session);
    // redirectToCheckout navigates away — if we're still here it failed
    setPendingPlan(null);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(165deg, #F0F9FF 0%, #EAF5F5 35%, #F7FAFC 65%, #FFFFFF 100%)' }}>
        <Loader2 className="animate-spin" size={28} style={{ color: 'var(--uid-teal)' }} />
      </div>
    );
  }

  const plans = Object.values(PLANS);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #F0F9FF 0%, #EAF5F5 35%, #F7FAFC 65%, #FFFFFF 100%)', position: 'relative', overflow: 'hidden', paddingTop: '90px', paddingBottom: '4rem' }}>
      <div className="ottoman-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      {/* Orbs */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,200,200,0.12), transparent 70%)', animation: 'floatOrb 9s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,77,124,0.06), transparent 70%)', animation: 'floatOrb 11s ease-in-out infinite 2s', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '960px', margin: '0 auto', padding: '2rem 1.25rem' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/" style={{ display: 'inline-flex', marginBottom: '2rem' }}>
            <UIDLogo width={140} />
          </Link>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontWeight: 600, marginBottom: '0.75rem', fontFamily: "'DM Sans', sans-serif" }}>
            Choose Your Plan
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(34px, 5vw, 48px)', fontWeight: 400, color: 'var(--uid-navy)', margin: '0 0 1rem', lineHeight: 1.15 }}>
            <em>Membership Selection</em>
          </h1>
          <p style={{ fontSize: '15.5px', color: 'var(--text-mid)', fontWeight: 300, maxWidth: '480px', margin: '0 auto', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
            Select the membership plan that works for you. Your membership activates instantly after payment.
          </p>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', maxWidth: '760px', margin: '0 auto' }}>
          {plans.map((plan, idx) => (
            <PlanCard key={plan.id} plan={plan} isAnnual={plan.id === 'annual'} onSelect={handleSelectPlan} loading={pendingPlan === plan.id} delay={idx * 0.15} />
          ))}
        </div>

        {/* Trust row */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.5rem 2rem', marginTop: '2.5rem' }}>
          {['Secure payment via Stripe', 'Cancel anytime', 'Instant activation'].map(trust => (
            <span key={trust} style={{ fontSize: '12px', color: 'var(--text-soft)', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: "'DM Sans', sans-serif" }}>
              <span style={{ color: 'var(--uid-teal)', fontSize: '10px' }}>✦</span> {trust}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan, isAnnual, onSelect, loading, delay }: { plan: PlanInfo; isAnnual: boolean; onSelect: (id: PlanId) => void; loading: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: isAnnual ? 'linear-gradient(160deg, #0D4D7C 0%, #061E30 100%)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2.25rem',
        position: 'relative',
        overflow: 'hidden',
        border: isAnnual ? 'none' : '1px solid rgba(62,200,200,0.18)',
        boxShadow: isAnnual ? '0 24px 60px rgba(13,77,124,0.3)' : '0 16px 48px rgba(13,77,124,0.1)',
      }}
    >
      {isAnnual && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', background: 'linear-gradient(90deg, transparent, rgba(62,200,200,0.1), transparent)', backgroundSize: '300% 100%', animation: 'borderTrace 4s linear infinite', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '1.5px', pointerEvents: 'none' }} />
      )}

      {/* Badge */}
      {plan.savings && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '99px', background: 'rgba(62,200,200,0.18)', border: '1px solid rgba(62,200,200,0.3)', marginBottom: '1.25rem' }}>
          <TrendingDown size={13} color="var(--uid-teal)" />
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--uid-teal)', fontFamily: "'DM Sans', sans-serif" }}>{plan.savings}</span>
        </div>
      )}

      {/* Plan name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isAnnual ? 'rgba(62,200,200,0.18)' : 'rgba(62,200,200,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {plan.interval === 'year' ? <Calendar size={16} style={{ color: 'var(--uid-teal)' }} /> : <Sparkles size={16} style={{ color: 'var(--uid-teal)' }} />}
        </div>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: isAnnual ? 'rgba(255,255,255,0.65)' : 'var(--text-soft)', margin: 0 }}>
          {plan.name}
        </p>
      </div>

      {/* Price */}
      <div style={{ marginBottom: '0.5rem' }}>
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '56px', fontWeight: 400, color: isAnnual ? '#fff' : 'var(--uid-navy)', lineHeight: 1, letterSpacing: '-2px' }}>
          {plan.currency} ${plan.price}
        </span>
        <span style={{ fontSize: '15px', fontWeight: 300, color: isAnnual ? 'rgba(255,255,255,0.5)' : 'var(--text-soft)', fontFamily: "'DM Sans', sans-serif" }}>
          /{plan.interval}
        </span>
      </div>
      <p style={{ fontSize: '13px', fontWeight: 300, color: isAnnual ? 'rgba(255,255,255,0.55)' : 'var(--text-mid)', margin: '0 0 1.75rem', fontFamily: "'DM Sans', sans-serif" }}>
        {plan.description}
      </p>

      {/* Divider */}
      <div style={{ height: '1px', background: isAnnual ? 'rgba(255,255,255,0.1)' : 'rgba(13,77,124,0.08)', marginBottom: '1.5rem' }} />

      {/* Features */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {plan.features.map((f, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div style={{ minWidth: '18px', height: '18px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px', flexShrink: 0 }}>
              <Check size={10} color="#fff" />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 300, color: isAnnual ? 'rgba(255,255,255,0.82)' : 'var(--text-mid)', margin: 0, lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{f}</p>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        className="shimmer-btn"
        onClick={() => onSelect(plan.id)}
        disabled={loading}
        style={{
          width: '100%', padding: '15px', borderRadius: '99px', fontSize: '15px', fontWeight: 500,
          background: isAnnual ? 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))' : 'linear-gradient(135deg, #0D4D7C, #1A6A9A)',
          color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          transition: 'transform 0.3s, box-shadow 0.3s',
          opacity: loading ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = isAnnual ? '0 14px 36px rgba(62,200,200,0.35)' : '0 14px 36px rgba(13,77,124,0.3)'; } }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
      >
        {loading ? (<><Loader2 size={16} className="animate-spin" /> Redirecting…</>) : isAnnual ? 'Choose Annual' : 'Become a Member'}
      </button>
    </motion.div>
  );
}
