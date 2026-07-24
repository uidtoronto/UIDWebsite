import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

// ───────────────────────────────────────────────────────────
// Stripe Webhook Endpoint
//
// Verifies the Stripe signature on every request, then dispatches
// each event to a handler that keeps the `stripe_subscriptions`
// table in sync with Stripe. This table is the source of truth for
// subscription status; the client reads it through the
// `stripe_user_subscriptions` view.
//
// Events handled:
//   - checkout.session.completed
//   - customer.subscription.updated
//   - customer.subscription.deleted
//   - invoice.paid
//   - invoice.payment_failed
// ───────────────────────────────────────────────────────────

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: { name: 'Bolt Integration', version: '1.0.0' },
});

// Service-role client — bypasses RLS so the webhook can write.
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

Deno.serve(async (req) => {
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Stripe sends the signature in this header
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // Raw body is required for signature verification
    const body = await req.text();

    // Verify the webhook signature — rejects forged/invalid requests
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    // Process asynchronously so we return 200 quickly (Stripe retries on non-2xx)
    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ── Event dispatcher ──
async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};
  if (!stripeData) return;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeData as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeData as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeData as Stripe.Subscription);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(stripeData as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeData as Stripe.Invoice);
        break;
      default:
        console.info(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling event ${event.type}:`, error);
    throw error;
  }
}

// ── checkout.session.completed ──
// Fires when a checkout succeeds. For subscriptions, sync the full
// subscription state from Stripe. For one-time payments, record the order.
// Also activates a member record if the session carries member_id metadata.
//
// For Stripe Payment Links (no prior edge-function checkout), there is no
// stripe_customers mapping yet — we resolve the Supabase user by the
// customer email and create the mapping here.
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  if (!customerId) {
    console.error('checkout.session.completed: no customer id');
    return;
  }

  const isSubscription = session.mode === 'subscription';
  console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout for ${customerId}`);

  // ── Ensure stripe_customers mapping exists ──
  // Payment Link checkouts don't go through our edge function, so the
  // mapping between the Stripe customer and the Supabase user may not
  // exist yet. Resolve by email and create it if missing.
  const { data: existingMapping } = await supabase
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!existingMapping) {
    // Get the customer's email from Stripe (Payment Links may not include
    // it in the session object, so fetch from the customer record).
    let customerEmail = session.customer_email || session.customer_details?.email;
    if (!customerEmail) {
      const customer = await stripe.customers.retrieve(customerId);
      customerEmail = typeof customer === 'object' && !('deleted' in customer) ? customer.email : null;
    }

    if (customerEmail) {
      // Resolve the Supabase user_id by email via the lookup function
      const { data: userId } = await supabase.rpc('get_user_id_by_email', { p_email: customerEmail });

      if (userId) {
        // Check if a mapping already exists for this user (different Stripe customer)
        const { data: userMapping } = await supabase
          .from('stripe_customers')
          .select('customer_id')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .maybeSingle();

        if (!userMapping) {
          const { error: createMappingError } = await supabase.from('stripe_customers').insert({
            user_id: userId,
            customer_id: customerId,
          });

          if (createMappingError) {
            console.error('Failed to create stripe_customers mapping:', createMappingError);
          } else {
            console.info(`Created stripe_customers mapping: user ${userId} → customer ${customerId}`);
          }
        } else if (userMapping.customer_id !== customerId) {
          // User had a different customer ID — update it
          const { error: updateMappingError } = await supabase
            .from('stripe_customers')
            .update({ customer_id: customerId })
            .eq('user_id', userId)
            .is('deleted_at', null);

          if (updateMappingError) {
            console.error('Failed to update stripe_customers mapping:', updateMappingError);
          } else {
            console.info(`Updated stripe_customers mapping: user ${userId} → customer ${customerId}`);
          }
        }
      } else {
        console.info(`No Supabase user found for email ${customerEmail} — skipping customer mapping`);
      }
    } else {
      console.info(`No email available for customer ${customerId} — skipping customer mapping`);
    }
  }

  // ── Membership activation ──
  // If the checkout session was created from the membership registration flow,
  // it carries a member_id in metadata. Mark that member active now that payment succeeded.
  const memberId = session.metadata?.member_id;
  if (memberId) {
    const { error: memberErr } = await supabase
      .from('members')
      .update({
        payment_status: 'active',
        status: 'active',
        stripe_customer_id: customerId,
        stripe_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId);
    if (memberErr) console.error('Failed to activate member:', memberErr);
    else console.info(`Member ${memberId} activated after checkout.`);
  }

  if (isSubscription) {
    await syncCustomerFromStripe(customerId);
  } else if (session.mode === 'payment' && session.payment_status === 'paid') {
    const { error } = await supabase.from('stripe_orders').insert({
      checkout_session_id: session.id,
      payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? '',
      customer_id: customerId,
      amount_subtotal: session.amount_subtotal ?? 0,
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? 'cad',
      payment_status: session.payment_status,
      status: 'completed',
    });
    if (error) console.error('Error inserting order:', error);
  }
}

// Sync subscription fields onto the `members` row matching the Stripe customer.
// Keeps members.subscription_status / subscription_plan / renewal_date /
// stripe_subscription_id aligned with the Stripe source of truth.
async function syncMemberSubscription(customerId: string, subscription: Stripe.Subscription) {
  const interval = subscription.items.data[0]?.price.recurring?.interval ?? null;
  const planLabel = interval === 'year' ? 'annual' : interval === 'month' ? 'monthly' : 'unknown';
  const renewalDate = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  const { error } = await supabase
    .from('members')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_plan: planLabel,
      subscription_status: subscription.status,
      renewal_date: renewalDate,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) console.error(`Failed to sync member subscription for ${customerId}:`, error);
}

// ── customer.subscription.updated ──
// Fires on plan changes, status transitions, etc. Re-sync from Stripe.
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  if (!customerId) {
    console.error('customer.subscription.updated: no customer id');
    return;
  }
  console.info(`Subscription updated for customer: ${customerId}`);
  await syncCustomerFromStripe(customerId);
}

// ── customer.subscription.deleted ──
// Fires when a subscription is cancelled. Mark it as cancelled.
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  if (!customerId) {
    console.error('customer.subscription.deleted: no customer id');
    return;
  }
  console.info(`Subscription deleted for customer: ${customerId}`);

  const { error } = await supabase.from('stripe_subscriptions').upsert(
    {
      customer_id: customerId,
      subscription_id: subscription.id,
      price_id: subscription.items.data[0]?.price.id ?? null,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      status: 'canceled',
    },
    { onConflict: 'customer_id' },
  );
  if (error) console.error('Error marking subscription deleted:', error);
}

// ── invoice.paid ──
// Fires when a recurring invoice is paid. Re-sync to refresh period dates.
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  if (!customerId) {
    console.error('invoice.paid: no customer id');
    return;
  }
  console.info(`Invoice paid for customer: ${customerId}`);
  await syncCustomerFromStripe(customerId);
}

// ── invoice.payment_failed ──
// Fires when a renewal payment fails. Re-sync to capture past_due status.
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  if (!customerId) {
    console.error('invoice.payment_failed: no customer id');
    return;
  }
  console.info(`Invoice payment failed for customer: ${customerId}`);
  await syncCustomerFromStripe(customerId);
}

// ── Sync helper ──
// Fetches the latest subscription for a customer from Stripe and upserts
// the full state into `stripe_subscriptions`. Based on t3dotgg/stripe-recommendations.
async function syncCustomerFromStripe(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      console.info(`No subscriptions found for customer: ${customerId}`);
      const { error } = await supabase.from('stripe_subscriptions').upsert(
        { customer_id: customerId, subscription_status: 'not_started' },
        { onConflict: 'customer_id' },
      );
      if (error) console.error('Error updating subscription status:', error);
      return;
    }

    // Assumes a single subscription per customer
    const subscription = subscriptions.data[0];

    const { error } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0]?.price.id ?? null,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      { onConflict: 'customer_id' },
    );

    if (error) {
      console.error('Error syncing subscription:', error);
      throw new Error('Failed to sync subscription in database');
    }
    // Mirror subscription state onto the members row for this customer
    await syncMemberSubscription(customerId, subscription);
    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}
