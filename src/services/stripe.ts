import { supabase } from '../lib/supabase';
import type { MembershipType } from '../types';

// ── verifyPayment ────────────────────────────────────────────────
// Polls the `stripe_user_subscriptions` view (kept in sync by the
// webhook) to confirm the subscription is active. Called from the
// PaymentSuccess page after the embedded checkout completes.
export async function verifyPayment(_sessionId: string): Promise<{ paid: boolean; error?: string }> {
  try {
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
export async function activateMembership(plan: 'monthly' | 'annual'): Promise<{ membershipType?: MembershipType; error?: string }> {
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

// ── getSessionStatus ──────────────────────────────────────────────
// Polls a Stripe Checkout Session's status via the edge function.
// Used by the embedded checkout flow to detect completion.
export async function getSessionStatus(sessionId: string): Promise<{ status: string | null; error?: string }> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionData?.session?.access_token) {
      headers['Authorization'] = `Bearer ${sessionData.session.access_token}`;
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout?session_id=${sessionId}`,
      { headers },
    );

    if (!response.ok) {
      return { status: null, error: 'Failed to fetch session status' };
    }

    const { status } = await response.json();
    return { status: status ?? null };
  } catch (e) {
    return { status: null, error: e instanceof Error ? e.message : 'Status check failed' };
  }
}
