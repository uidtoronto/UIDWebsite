// ───────────────────────────────────────────────────────────
// Stripe Checkout Service
//
// Currently using a Stripe Payment Link for checkout.  When you are
// ready to move to full Stripe Sessions with webhooks:
//
//   1.  Add the following values to your `.env` file:
//
//         VITE_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_...
//
//       The secret key and webhook secret live server-side only
//       (e.g. in a Supabase Edge Function or backend route):
//
//         STRIPE_SECRET_KEY=sk_live_or_test_...
//         STRIPE_WEBHOOK_SECRET=whsec_...
//
//   2.  Uncomment the Stripe imports and replace the TODO bodies
//       with the real Stripe calls.  The function signatures and
//       return types stay the same, so no UI changes are needed.
//
//   3.  Create a Supabase Edge Function (or backend endpoint) that:
//       - Receives the checkout request from the client.
//       - Uses STRIPE_SECRET_KEY to create a Checkout Session.
//       - Returns the session URL (or session ID) to the client.
//       - Has a separate webhook handler that receives Stripe events
//         and updates `membership_status` in the `profiles` table.
//
//   4.  In the Stripe Dashboard, configure the Payment Link's
//       "After payment" → "Success URL" to:
//         https://yourdomain.com/payment-success
//       and "Cancel URL" to:
//         https://yourdomain.com/payment-cancelled
// ───────────────────────────────────────────────────────────

import type { MembershipType } from '../types';

// Stripe Payment Link (test mode)
const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_cNieVc22UasGca21Ak3gk00';

// import { loadStripe } from '@stripe/stripe-js';
// const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;
// export const stripePromise = loadStripe(stripePublishableKey);

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

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── createCheckoutSession ───────────────────────────────────────
//
// In production this calls a Supabase Edge Function (or backend
// route) that uses STRIPE_SECRET_KEY server-side to create a Stripe
// Checkout Session and returns `{ sessionId, url }`.
//
export async function createCheckoutSession(plan: PlanId): Promise<{ session?: CheckoutSession; error?: string }> {
  await delay(600);

  // TODO: replace with real Stripe Checkout Session via backend:
  //
  // const res = await fetch('/api/create-checkout-session', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ plan }),
  // });
  // if (!res.ok) return { error: 'Failed to create checkout session' };
  // const data = await res.json();
  // return { session: { sessionId: data.sessionId, url: data.url } };

  // Using Stripe Payment Link with success/cancel URLs appended
  const baseUrl = window.location.origin;
  const successUrl = `${baseUrl}/payment-success?plan=${plan}`;
  const cancelUrl = `${baseUrl}/payment-cancelled`;
  const url = `${STRIPE_PAYMENT_LINK}?client_reference_id=${plan}&success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;

  console.info('[stripe.createCheckoutSession] redirecting to Payment Link for plan:', plan);
  return {
    session: {
      sessionId: `pl_${plan}_${Date.now()}`,
      url,
    },
  };
}

// ── redirectToCheckout ────────────────────────────────────────────
//
// In production this uses the Stripe.js client-side library to
// redirect the browser to the Stripe-hosted checkout page.
//
export async function redirectToCheckout(session: CheckoutSession): Promise<{ error?: string }> {
  // Using Payment Link: redirect the browser to the Stripe-hosted page
  window.location.href = session.url;
  return {};

  // TODO: real implementation using Stripe.js:
  //
  // const stripe = await stripePromise;
  // if (!stripe) return { error: 'Stripe failed to load' };
  // const { error } = await stripe.redirectToCheckout({ sessionId: session.sessionId });
  // return { error: error?.message };
}

// ── verifyPayment ────────────────────────────────────────────────
//
// In production this calls the backend to verify the payment status
// for a given session ID (or relies on the webhook to update
// `membership_status` in Supabase, then fetches the profile).
//
export async function verifyPayment(sessionId: string): Promise<{ paid: boolean; error?: string }> {
  await delay(500);

  // When using Payment Links, Stripe redirects back to the success_url
  // after payment.  The user landing on /payment-success is confirmation.
  // For full verification, use a webhook + backend lookup:
  //
  // const res = await fetch('/api/verify-payment', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ sessionId }),
  // });
  // if (!res.ok) return { paid: false, error: 'Verification failed' };
  // const data = await res.json();
  // return { paid: data.paid };

  console.info('[stripe.verifyPayment] verifying session:', sessionId);
  return { paid: true };
}

// ── activateMembership ────────────────────────────────────────────
//
// After the webhook confirms payment, the backend updates the
// profile's `membership_status` to `active`.  This client-side
// helper refreshes the local user object so the dashboard unlocks
// immediately without a page reload.
//
export async function activateMembership(plan: PlanId): Promise<{ membershipType?: MembershipType; error?: string }> {
  await delay(500);

  // TODO: real implementation:
  //
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) return { error: 'Not authenticated' };
  // const { data, error } = await supabase
  //   .from('profiles')
  //   .update({
  //     membership_status: 'active',
  //     membership_type: plan === 'annual' ? 'individual' : 'individual',
  //     renewal_date: plan === 'annual'
  //       ? new Date(Date.now() + 365 * 864e5).toISOString()
  //       : new Date(Date.now() + 30 * 864e5).toISOString(),
  //   })
  //   .eq('id', user.id)
  //   .select()
  //   .single();
  // if (error) return { error: error.message };
  // return { membershipType: data.membership_type };

  console.info('[stripe.activateMembership] mock activation for plan:', plan);
  return { membershipType: 'individual' };
}
