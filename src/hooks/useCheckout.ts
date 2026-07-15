import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface CheckoutOptions {
  priceId: string;
  mode: 'subscription' | 'payment';
  successPath?: string;
  cancelPath?: string;
}

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async ({
    priceId,
    mode,
    successPath = '/success',
    cancelPath = '/pricing',
  }: CheckoutOptions) => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error('You must be signed in to continue.');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId,
            mode,
            successUrl: `${window.location.origin}${successPath}`,
            cancelUrl: `${window.location.origin}${cancelPath}`,
          }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.error || 'Checkout failed. Please try again.');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
      setLoading(false);
    }
  };

  return { startCheckout, loading, error };
}