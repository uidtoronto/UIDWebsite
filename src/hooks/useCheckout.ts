import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface CheckoutOptions {
  priceId: string;
  mode: 'subscription' | 'payment';
  returnUrl?: string;
  memberId?: string;
}

interface CheckoutResult {
  clientSecret: string;
  sessionId: string;
}

// Calls the `stripe-checkout` Supabase Edge Function to create an
// Embedded Checkout Session. Returns a clientSecret that the caller
// passes to the <EmbeddedCheckout /> component — no redirect.
export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const startCheckout = useCallback(async ({
    priceId,
    mode,
    returnUrl,
    memberId,
  }: CheckoutOptions): Promise<CheckoutResult | null> => {
    setLoading(true);
    setError(null);
    setClientSecret(null);
    setSessionId(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            price_id: priceId,
            mode,
            return_url: returnUrl ?? `${window.location.origin}/dashboard`,
            member_id: memberId,
          }),
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || 'Checkout setup failed. Please try again.');
      }

      const { clientSecret: secret, sessionId: sid } = await response.json();

      if (!secret) {
        throw new Error('No checkout client secret returned.');
      }

      setClientSecret(secret);
      setSessionId(sid);
      return { clientSecret: secret, sessionId: sid };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong.';
      setError(msg);
      setLoading(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setClientSecret(null);
    setSessionId(null);
    setError(null);
    setLoading(false);
  }, []);

  return { startCheckout, loading, error, clientSecret, sessionId, reset };
}
