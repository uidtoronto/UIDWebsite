import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RotateCcw, Home } from 'lucide-react';
import { UIDLogo } from '../components/UIDLogo';

export default function PaymentCancelled() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(165deg, #F0F9FF 0%, #EAF5F5 35%, #F7FAFC 65%, #FFFFFF 100%)', position: 'relative', overflow: 'hidden', padding: '2rem' }}>
      <div className="ottoman-bg" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,77,124,0.06), transparent 70%)', animation: 'floatOrb 11s ease-in-out infinite', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '460px' }}>
        <Link to="/" style={{ display: 'inline-flex', marginBottom: '2rem' }}>
          <UIDLogo width={140} />
        </Link>

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 14 }} style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(220,38,38,0.1)', border: '2px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem' }}>
          <XCircle size={40} color="#dc2626" />
        </motion.div>

        <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#dc2626', fontWeight: 600, marginBottom: '0.75rem', fontFamily: "'DM Sans', sans-serif" }}>
          Payment Cancelled
        </p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 1rem', lineHeight: 1.2 }}>
          <em>Payment Not Completed</em>
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', fontWeight: 300, lineHeight: 1.7, margin: '0 0 2.5rem', fontFamily: "'DM Sans', sans-serif" }}>
          Your payment was not completed. Your account has been created, but you'll need to complete your membership payment to unlock all member benefits.
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/membership" className="shimmer-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '99px', fontSize: '15px', fontWeight: 500, background: 'linear-gradient(135deg, #0D4D7C, #1A6A9A)', color: '#fff', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'transform 0.3s, box-shadow 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(13,77,124,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
            <RotateCcw size={17} />
            Try Again
          </Link>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '99px', fontSize: '15px', fontWeight: 400, background: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(13,77,124,0.2)', color: 'var(--uid-navy)', textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", transition: 'border-color 0.3s, color 0.3s, transform 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--uid-teal)'; e.currentTarget.style.color = 'var(--uid-teal)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(13,77,124,0.2)'; e.currentTarget.style.color = 'var(--uid-navy)'; e.currentTarget.style.transform = ''; }}>
            <Home size={17} />
            Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
