/*
# Auto-create exec_members row on signup

## Summary
The hardened RLS policies on exec_* tables require an existing
exec_members row (user_id = auth.uid(), is_active = true) for access.
But admin signup only creates an auth.users row — no exec_members row
is inserted. This creates a chicken-and-egg deadlock: the user can't
insert into exec_members because the INSERT policy requires an existing
exec_members row.

This migration adds a trigger on auth.users that automatically creates
an exec_members row when a new user signs up. The trigger function runs
as SECURITY DEFINER (supabase_admin) so it bypasses RLS for the initial
insert only.

## Security
- Function runs as SECURITY DEFINER with a fixed search_path
- Only fires on INSERT (new user creation)
- Inserts a default exec_members row with is_active = true
- Uses COALESCE for metadata fields that may be absent
*/

-- ── Trigger function: create exec_members row on new auth user ──
CREATE OR REPLACE FUNCTION public.handle_new_exec_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  INSERT INTO public.exec_members (user_id, first_name, last_name, email, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.email, ''),
    true
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- ── Trigger on auth.users ──
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_exec_member();

-- ── Backfill: create exec_members rows for any existing auth users ──
INSERT INTO public.exec_members (user_id, first_name, last_name, email, is_active)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'first_name', ''),
  COALESCE(u.raw_user_meta_data->>'last_name', ''),
  COALESCE(u.email, ''),
  true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.exec_members em WHERE em.user_id = u.id
)
ON CONFLICT DO NOTHING;
