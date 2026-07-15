/*
# Create members table — member roster management

## Summary
Adds a `members` table for the member management admin feature. This is shared
organizational data (a roster), not per-user-owned data, so any authenticated
user can read/write all rows — matching the pattern used by the existing
exec_* tables in this project.

## New Tables
- `members`
  - `id`          uuid, primary key
  - `email`       text, unique, not null
  - `first_name`  text, not null
  - `last_name`   text, not null
  - `phone`       text, nullable
  - `city`        text, nullable
  - `status`      text, not null, default 'active' (active | inactive | pending | suspended)
  - `created_at`  timestamptz, default now()

## Security
- RLS enabled on `members`.
- Four CRUD policies scoped to `authenticated` (the app has a sign-in screen).
  Data is intentionally shared across authenticated admins, so `USING (true)`
  is documented here as the intended access model, not a shortcut.

## Indexes
- `members_status_idx` on `status` (frequent filter)
- `members_created_at_idx` on `created_at DESC` (recent-members query)
- `members_name_idx` on `first_name, last_name` (sort + search)

## Seed
- 14 sample members across active/inactive/pending/suspended statuses.
*/

CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text,
  city text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_select" ON members;
CREATE POLICY "members_select" ON members FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "members_insert" ON members;
CREATE POLICY "members_insert" ON members FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "members_update" ON members;
CREATE POLICY "members_update" ON members FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "members_delete" ON members;
CREATE POLICY "members_delete" ON members FOR DELETE
  TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS members_status_idx ON members (status);
CREATE INDEX IF NOT EXISTS members_created_at_idx ON members (created_at DESC);
CREATE INDEX IF NOT EXISTS members_name_idx ON members (first_name, last_name);

INSERT INTO members (email, first_name, last_name, phone, city, status) VALUES
  ('ahmed.yilmaz@email.com',   'Ahmed',   'Yilmaz',  '+1 (416) 555-0101', 'Toronto',      'active'),
  ('fatima.ozturk@email.com',  'Fatima',  'Ozturk',  '+1 (416) 555-0102', 'Mississauga',  'active'),
  ('mustafa.demir@email.com',  'Mustafa', 'Demir',   '+1 (647) 555-0103', 'Brampton',     'active'),
  ('zeynep.kaya@email.com',    'Zeynep',  'Kaya',    '+1 (905) 555-0104', 'Vaughan',      'inactive'),
  ('ibrahim.arslan@email.com', 'Ibrahim', 'Arslan',  '+1 (416) 555-0105', 'Toronto',      'active'),
  ('ayse.celik@email.com',     'Ayse',    'Celik',   '+1 (416) 555-0106', 'Toronto',      'active'),
  ('hasan.sahin@email.com',    'Hasan',   'Sahin',   '+1 (647) 555-0107', 'Scarborough',  'pending'),
  ('nurcan.polat@email.com',   'Nurcan',  'Polat',   '+1 (905) 555-0108', 'Oakville',     'active'),
  ('emre.yildiz@email.com',    'Emre',    'Yildiz',  '+1 (416) 555-0109', 'Toronto',      'pending'),
  ('selin.acar@email.com',     'Selin',   'Acar',    '+1 (647) 555-0110', 'Markham',      'active'),
  ('burak.ozdemir@email.com',  'Burak',   'Ozdemir', '+1 (905) 555-0111', 'Etobicoke',    'suspended'),
  ('deniz.kaplan@email.com',   'Deniz',   'Kaplan',  '+1 (416) 555-0112', 'Toronto',      'active'),
  ('caner.turk@email.com',     'Caner',   'Turk',    '+1 (647) 555-0113', 'North York',   'inactive'),
  ('elay.yurt@email.com',      'Elay',    'Yurt',    '+1 (905) 555-0114', 'Vaughan',      'active')
ON CONFLICT (email) DO NOTHING;
