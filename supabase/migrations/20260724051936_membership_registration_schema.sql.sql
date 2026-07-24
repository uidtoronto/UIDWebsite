/*
# Membership Registration — extend members + add family_members

## Summary
Extends the existing `members` table with full registration fields
(birthdate, address, membership type, payment status, Stripe linkage) and
adds a new `family_members` child table for family registrations.

## Changes to existing tables
- `members` — adds nullable columns so existing seed rows are unaffected:
  - `birth_date`       date, nullable
  - `mobile_phone`     text, nullable (separate from existing `phone`)
  - `address_line1`    text, nullable
  - `address_line2`    text, nullable
  - `city`             already exists
  - `province`         text, nullable
  - `postal_code`      text, nullable
  - `country`          text, nullable
  - `membership_type`  text, nullable ('adult' | 'student' | 'pensioner')
  - `is_family`        boolean, default false
  - `payment_status`   text, default 'pending' ('pending' | 'active' | 'failed' | 'cancelled')
  - `stripe_customer_id`   text, nullable
  - `stripe_checkout_id`   text, nullable
  - `stripe_session_id`    text, nullable
  - `updated_at`       timestamptz, default now()

## New Tables
- `family_members`
  - `id`              uuid, primary key
  - `member_id`       uuid, FK -> members(id) ON DELETE CASCADE
  - `full_name`       text, not null
  - `age`             int, nullable
  - `gender`          text, nullable ('male' | 'female')
  - `member_type`     text, nullable ('adult' | 'child')
  - `created_at`      timestamptz, default now()

## Security
- RLS enabled on `family_members`.
- Four CRUD policies scoped to `authenticated` (shared roster model,
  matching the existing members table).
- members RLS policies already exist and remain in force.

## Indexes
- `family_members_member_id_idx` on `member_id`
- `members_payment_status_idx` on `payment_status`
- `members_membership_type_idx` on `membership_type`

## Notes
1. All new columns on `members` are nullable / have defaults so the 14
   existing seed rows continue to work unchanged.
2. `payment_status` replaces the overload on `status` for payment tracking.
   The legacy `status` column is retained for backward compatibility.
*/

-- ── Extend members table ──
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS mobile_phone text,
  ADD COLUMN IF NOT EXISTS address_line1 text,
  ADD COLUMN IF NOT EXISTS address_line2 text,
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS membership_type text DEFAULT 'adult',
  ADD COLUMN IF NOT EXISTS is_family boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_checkout_id text,
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ── Create family_members table ──
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  age int,
  gender text,
  member_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "family_members_select" ON family_members;
CREATE POLICY "family_members_select" ON family_members FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "family_members_insert" ON family_members;
CREATE POLICY "family_members_insert" ON family_members FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "family_members_update" ON family_members;
CREATE POLICY "family_members_update" ON family_members FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "family_members_delete" ON family_members;
CREATE POLICY "family_members_delete" ON family_members FOR DELETE
  TO authenticated USING (true);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS family_members_member_id_idx ON family_members (member_id);
CREATE INDEX IF NOT EXISTS members_payment_status_idx ON members (payment_status);
CREATE INDEX IF NOT EXISTS members_membership_type_idx ON members (membership_type);

-- ── updated_at trigger ──
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS members_updated_at ON members;
CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
