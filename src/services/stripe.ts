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

export const PLANS: Record<PlanId, PlanInfo & { paymentLinkUrl: string }> = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Membership',
    price: 20,
    currency: 'CAD',
    interval: 'month',
    description: 'Flexible month-to-month membership.',
    paymentLinkUrl: 'https://buy.stripe.com/test_eVq28sgth4IYcxgcDEdEs00',
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
    price: 240,
    currency: 'CAD',
    interval: 'year',
    description: 'Best value — save $240 compared to monthly.',
    paymentLinkUrl: 'https://buy.stripe.com/test_28E9AUdh58Ze40KgTUdEs01',
    features: [
      'Everything in Monthly',
      'Save $240 per year',
      'Priority event registration',
      'Exclusive annual member reception',
      'Free guest pass to one event',
    ],
    savings: 'Save $240/year',
  },
};

// ── redirectToPaymentLink ───────────────────────────────────────
// Redirects the browser to a Stripe Payment Link — a pre-built hosted
// checkout page. The "after payment" redirect URL is configured in the
// Stripe Dashboard for each payment link and should point to:
//   https://your-domain/payment-success?plan={PLAN_ID}&session_id={CHECKOUT_SESSION_ID}
export async function redirectToPaymentLink(plan: PlanId): Promise<{ error?: string }> {
  const planInfo = PLANS[plan];
  if (!planInfo?.paymentLinkUrl) return { error: 'Invalid plan selected.' };
  window.location.href = planInfo.paymentLinkUrl;
  return {};
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
