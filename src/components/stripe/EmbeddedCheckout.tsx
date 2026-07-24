import { useEffect, useRef, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, AlertCircle, X } from 'lucide-react';

interface EmbeddedCheckoutProps {
  clientSecret: string;
  onClose: () => void;
  onComplete: () => void;
}

interface StripeEmbeddedCheckoutInstance {
  mount: (el: HTMLElement) => void;
  destroy: () => void;
}

interface StripeWithEmbedded {
  initEmbeddedCheckout: (opts: { clientSecret: string }) => Promise<StripeEmbeddedCheckoutInstance>;
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : Promise.reject(new Error('Missing VITE_STRIPE_PUBLISHABLE_KEY'));

export function EmbeddedCheckout({ clientSecret, onClose, onComplete }: EmbeddedCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkoutRef = useRef<StripeEmbeddedCheckoutInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let destroyed = false;

    (async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe || destroyed || !containerRef.current) return;

        const checkout = await (stripe as unknown as StripeWithEmbedded).initEmbeddedCheckout({
          clientSecret,
        });

        if (destroyed) {
          checkout.destroy();
          return;
        }

        checkout.mount(containerRef.current);
        checkoutRef.current = checkout;
        setLoading(false);
      } catch (e) {
        if (!destroyed) {
          setError(e instanceof Error ? e.message : 'Failed to load checkout');
          setLoading(false);
        }
      }
    })();

    return () => {
      destroyed = true;
      if (checkoutRef.current) {
        checkoutRef.current.destroy();
        checkoutRef.current = null;
      }
    };
  }, [clientSecret]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(13, 77, 124, 0.55)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflowY: 'auto',
        padding: '2rem 1rem',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(62,200,200,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--uid-teal)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 600, color: '#fff' }}>
              Secure Checkout
            </p>
            <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              Powered by Stripe
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close checkout"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.08)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Checkout container */}
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          background: '#fff',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
          minHeight: '300px',
          position: 'relative',
        }}
      >
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--uid-teal)' }} />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: 'var(--text-mid)' }}>
              Loading secure checkout…
            </p>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', gap: '0.75rem' }}>
            <AlertCircle size={36} style={{ color: '#dc2626' }} />
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 600, color: 'var(--uid-navy)', margin: 0, textAlign: 'center' }}>
              Checkout could not be loaded
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: 'var(--text-mid)', margin: 0, textAlign: 'center', maxWidth: '360px' }}>
              {error}
            </p>
            <button
              onClick={onClose}
              style={{
                marginTop: '0.5rem',
                padding: '10px 24px',
                borderRadius: '99px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--uid-teal), var(--uid-mid))',
                color: '#fff',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Go back
            </button>
          </div>
        )}

        <div ref={containerRef} style={{ opacity: loading || error ? 0 : 1 }} />

        {/* Hidden completion trigger — when Stripe completes, it calls
            the session's return_url. The parent handles navigation.
            This overlay detects when the checkout iframe unmounts
            (Stripe redirects on completion). */}
      </div>

      {/* Complete button — shown after payment, parent handles redirect */}
      <button
        onClick={onComplete}
        style={{
          marginTop: '1rem',
          padding: '12px 32px',
          borderRadius: '99px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.6)',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'none',
        }}
        id="embedded-complete-btn"
      />
    </div>
  );
}
