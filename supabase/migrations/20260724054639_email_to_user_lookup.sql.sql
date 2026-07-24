/*
# Lookup Supabase user by email — for Stripe Payment Link webhook

## Summary
Stripe Payment Links create a checkout session without a prior link to a
Supabase user. When the webhook receives `checkout.session.completed`,
it only has the Stripe customer email — not the Supabase user_id.

This function lets the webhook (running as service_role) resolve a
Supabase auth user by email so it can create the `stripe_customers`
mapping row. Without this mapping, the `stripe_user_subscriptions` view
returns nothing and the client cannot verify the payment.

## Security
- SECURITY DEFINER, runs as the migration/owner role
- Fixed immutable search_path
- Only callable by service_role (the webhook) — no RLS bypass needed
  on auth.users since SECURITY DEFINER already elevates
*/

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, auth
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;

  RETURN v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_id_by_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_id_by_email(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(text) TO service_role;
