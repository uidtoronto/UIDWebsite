import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getProductByPriceId, type StripeProduct } from '../stripe-config';

export interface SubscriptionData {
  customer_id: string | null;
  subscription_id: string | null;
  subscription_status: string | null;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export interface UseSubscriptionReturn {
  subscription: SubscriptionData | null;
  product: StripeProduct | undefined;
  isActive: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchSubscription() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();

        if (err) throw err;
        if (!cancelled) setSubscription(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load subscription');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSubscription();
    return () => { cancelled = true; };
  }, [tick]);

  const isActive =
    subscription?.subscription_status === 'active' ||
    subscription?.subscription_status === 'trialing';

  const product = subscription?.price_id
    ? getProductByPriceId(subscription.price_id)
    : undefined;

  return {
    subscription,
    product,
    isActive,
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  };
}