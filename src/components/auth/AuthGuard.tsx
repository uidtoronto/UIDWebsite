import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';

interface AuthGuardProps {
  children: ReactNode;
}

// Protects /dashboard — requires an authenticated user with an active
// subscription. Non-authenticated users are sent to /login; authenticated
// users without an active subscription are sent to /pricing.
export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();

  const loading = isLoading || subLoading;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(165deg, #F0F9FF 0%, #EAF5F5 35%, #F7FAFC 65%, #FFFFFF 100%)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--uid-teal)' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: '13px', color: 'var(--text-mid)', fontFamily: "'DM Sans', sans-serif" }}>Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isActive) return <Navigate to="/pricing" replace />;
  return <>{children}</>;
}
