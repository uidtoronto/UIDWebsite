import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldX, LogIn } from 'lucide-react';
import { UIDLogo } from '../components/UIDLogo';

export default function Unauthorized() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(165deg, #F0F9FF 0%, #EAF5F5 35%, #F7FAFC 65%, #FFFFFF 100%)', padding: '2rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', maxWidth: '480px' }}>
        <Link to="/" style={{ display: 'inline-flex', marginBottom: '2rem' }}>
          <UIDLogo width={140} />
        </Link>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(245,158,11,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <ShieldX size={40} color="#b45309" />
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 500, color: 'var(--uid-navy)', margin: '0 0 0.5rem', lineHeight: 1 }}>
          <em>Access denied</em>
        </p>
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '20px', fontWeight: 600, color: 'var(--uid-dark)', margin: '0 0 1rem' }}>
          You don't have access to this page
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-mid)', fontWeight: 300, lineHeight: 1.7, margin: '0 0 2rem', fontFamily: "'DM Sans', sans-serif" }}>
          This area requires an active membership. Sign in or complete your registration to continue.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '99px', fontSize: '15px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg, #0D4D7C, #1A6A9A)', color: '#fff', textDecoration: 'none' }}>
            <LogIn size={17} /> Sign in
          </Link>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 32px', borderRadius: '99px', fontSize: '15px', fontWeight: 500, fontFamily: "'DM Sans', sans-serif", background: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(13,77,124,0.2)', color: 'var(--uid-navy)', textDecoration: 'none' }}>
            Become a member
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
