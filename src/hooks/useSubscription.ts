import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getProductByPriceId, StripeProduct } from '../stripe-config';

export interface SubscriptionState {
  loading: boolean;
  subscription: {
    status: string;
    priceId: string | null;
    product: StripeProduct | null;
  } | null;
  error: string | null;
}

export function useSubscription(userId: string | undefined) {
  const [state, setState] = useState<SubscriptionState>({
    loading: true,
    subscription: null,
    error: null,
  });

  useEffect(() => {
    if (!userId) {
      setState({ loading: false, subscription: null, error: null });
      return;
    }

    async function fetchSubscription() {
      try {
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('subscription_status, price_id')
          .maybeSingle();

        if (error) throw error;

        if (data && data.subscription_status === 'active') {
          const product = data.price_id ? getProductByPriceId(data.price_id) : null;
          setState({
            loading: false,
            subscription: {
              status: data.subscription_status,
              priceId: data.price_id,
              product: product ?? null,
            },
            error: null,
          });
        } else {
          setState({ loading: false, subscription: null, error: null });
        }
      } catch (err) {
        setState({
          loading: false,
          subscription: null,
          error: err instanceof Error ? err.message : 'Failed to load subscription',
        });
      }
    }

    fetchSubscription();
  }, [userId]);

  return state;
}