import { supabase } from './supabase';

export async function createCheckoutSession(priceId: string, mode: 'subscription' | 'payment') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price_id: priceId,
      mode,
      success_url: `${window.location.origin}/success`,
      cancel_url: `${window.location.origin}/membership`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  const data = await response.json();
  return data;
}

export async function getSubscription() {
  const { data, error } = await supabase
    .from('stripe_user_subscriptions')
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data;
}