import { supabase } from '../lib/supabase';
import type { MembershipType } from '../types';

export type PlanId = 'monthly' | 'annual';

export interface PlanInfo {
  id: PlanId;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  savings?: string;
}

export const PLANS: Record<PlanId, PlanInfo> = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Membership',
    price: 20,
    currency: 'CAD',
    interval: 'month',
    description: 'Flexible month-to-month membership.',
    features: [
      'Official UID Toronto Membership',
      'Access to Member Dashboard',
      'Member-only Events',
      'Partner Discounts',
      'Community Programs',
      'Networking Opportunities',
    ],
  },
  annual: {
    id: 'annual',
    name: 'Annual Membership',
    price: 200,
    currency: 'CAD',
    interval: 'year',
    description: 'Best value — save $40 compared to monthly.',
    features: [
      'Everything in Monthly',
      'Save $40 per year',
      'Priority event registration',
      'Exclusive annual member reception',
      'Free guest pass to one event',
    ],
    savings: 'Save $40/year',
  },
};

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

// ── createCheckoutSession ───────────────────────────────────────
// Calls the `stripe-checkout` Supabase Edge Function which creates a
// Stripe Checkout Session server-side using STRIPE_SECRET_KEY.
export async function createCheckoutSession(plan: PlanId): Promise<{ session?: CheckoutSession; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: 'You must be signed in to continue.' };

    const priceId = plan === 'annual'
      ? 'price_1TsHPICIqsWOqM1zVMCiDCJZ'
      : 'price_1TsHOtCIqsWOqM1z3shb8WMU';

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          mode: 'subscription',
          success_url: `${window.location.origin}/payment-success`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { error: body?.error || 'Failed to create checkout session' };
    }

    const data = await response.json();
    return { session: { sessionId: data.sessionId, url: data.url } };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Checkout failed' };
  }
}

// ── redirectToCheckout ────────────────────────────────────────────
// Redirects the browser to the Stripe-hosted checkout page.
export async function redirectToCheckout(session: CheckoutSession): Promise<{ error?: string }> {
  if (session.url) {
    window.location.href = session.url;
    return {};
  }
  return { error: 'No checkout URL available' };
}

// ── verifyPayment ────────────────────────────────────────────────
// After returning from Stripe, polls the `stripe_user_subscriptions`
// view (kept in sync by the webhook) to confirm the subscription is active.
export async function verifyPayment(_sessionId: string): Promise<{ paid: boolean; error?: string }> {
  try {
    // Poll a few times — the webhook may take a moment to process
    for (let attempt = 0; attempt < 6; attempt++) {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status')
        .maybeSingle();

      if (error) return { paid: false, error: error.message };

      const status = data?.subscription_status;
      if (status === 'active' || status === 'trialing') {
        return { paid: true };
      }
      await new Promise(r => setTimeout(r, 1500));
    }
    return { paid: false, error: 'Payment not confirmed yet. If you completed payment, please refresh in a moment.' };
  } catch (e) {
    return { paid: false, error: e instanceof Error ? e.message : 'Verification failed' };
  }
}

// ── activateMembership ────────────────────────────────────────────
// The webhook is the source of truth for subscription state. This
// client helper updates the user's auth metadata so the UI unlocks
// immediately after the webhook confirms the subscription.
export async function activateMembership(plan: PlanId): Promise<{ membershipType?: MembershipType; error?: string }> {
  try {
    const renewalDate = plan === 'annual'
      ? new Date(Date.now() + 365 * 864e5).toISOString()
      : new Date(Date.now() + 30 * 864e5).toISOString();

    const { error } = await supabase.auth.updateUser({
      data: {
        membership_status: 'active',
        membership_type: 'individual',
        renewal_date: renewalDate,
      },
    });

    if (error) return { error: error.message };
    return { membershipType: 'individual' };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Activation failed' };
  }
}
