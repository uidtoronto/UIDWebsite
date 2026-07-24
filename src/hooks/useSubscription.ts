import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { STRIPE_PRODUCTS } from '../stripe-config';

export interface SubscriptionInfo {
  status: string | null;
  priceId: string | null;
  planName: string | null;
  isActive: boolean;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    status: null,
    priceId: null,
    planName: null,
    isActive: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  async function fetchSubscription() {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error || !data) {
        setSubscription({ status: null, priceId: null, planName: null, isActive: false });
        return;
      }

      const product = STRIPE_PRODUCTS.find(p => p.priceId === data.price_id);
      const isActive = data.subscription_status === 'active' || data.subscription_status === 'trialing';

      setSubscription({
        status: data.subscription_status,
        priceId: data.price_id,
        planName: product?.name ?? null,
        isActive,
      });
    } catch {
      setSubscription({ status: null, priceId: null, planName: null, isActive: false });
    } finally {
      setLoading(false);
    }
  }

  return { subscription, loading, refetch: fetchSubscription };
}