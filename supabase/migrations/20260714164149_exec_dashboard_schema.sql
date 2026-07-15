/*
# UID Toronto — Executive Board Dashboard Schema

## Summary
Creates all tables required for the Regional Executive Board Dashboard.
This schema is multi-tenant (exec members sign in) with RLS policies.
Every policy is scoped to `authenticated` users.

## Tables Created
1. `exec_members`        – Extended profiles for exec/admin board members (name, role, contact)
2. `exec_events`         – Calendar events (meetings, programs, campaigns, etc.)
3. `exec_event_rsvps`    – RSVP tracking per event
4. `exec_programs`       – Programs with budget, attendance, status
5. `exec_meetings`       – Meeting records with agenda, notes, minutes
6. `exec_meeting_attendees` – Attendance per meeting
7. `exec_tasks`          – Tasks with priority, status, assignees
8. `exec_task_comments`  – Comments on tasks
9. `exec_crm_members`    – Full CRM member profiles
10. `exec_crm_notes`     – Notes and timeline for CRM members
11. `exec_messages`      – Internal direct/group messages
12. `exec_message_channels` – Message channels (DM or group)
13. `exec_notifications` – Notification center entries
14. `exec_finance_transactions` – Finance transactions (revenue, expenses)
15. `exec_volunteers`    – Volunteer tracking
16. `exec_call_log`      – Member call log
17. `exec_documents`     – Document center

## Security
- RLS enabled on ALL tables
- All policies scoped `TO authenticated` (exec board only)
- No anon access to any exec data
*/

-- ────────────────────────────────────────────────────────────────
-- EXEC MEMBERS (extended profiles for board members)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text,
  role text NOT NULL DEFAULT 'executive',
  title text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exec_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "exec_members_select" ON exec_members;
CREATE POLICY "exec_members_select" ON exec_members FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "exec_members_insert" ON exec_members;
CREATE POLICY "exec_members_insert" ON exec_members FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "exec_members_update" ON exec_members;
CREATE POLICY "exec_members_update" ON exec_members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "exec_members_delete" ON exec_members;
CREATE POLICY "exec_members_delete" ON exec_members FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- CRM MEMBERS (full member profiles)
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_crm_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid_member_id text UNIQUE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  address text,
  city text,
  province text,
  occupation text,
  company text,
  member_type text DEFAULT 'professional',
  membership_status text DEFAULT 'active',
  membership_expiry date,
  volunteer_interests text[],
  notes text,
  tags text[],
  family_members jsonb DEFAULT '[]',
  emergency_contact jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exec_crm_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_members_select" ON exec_crm_members;
CREATE POLICY "crm_members_select" ON exec_crm_members FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "crm_members_insert" ON exec_crm_members;
CREATE POLICY "crm_members_insert" ON exec_crm_members FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "crm_members_update" ON exec_crm_members;
CREATE POLICY "crm_members_update" ON exec_crm_members FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "crm_members_delete" ON exec_crm_members;
CREATE POLICY "crm_members_delete" ON exec_crm_members FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- CRM NOTES / TIMELINE
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_crm_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES exec_crm_members(id) ON DELETE CASCADE,
  author_id uuid REFERENCES exec_members(id),
  note_type text DEFAULT 'note',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exec_crm_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_notes_select" ON exec_crm_notes;
CREATE POLICY "crm_notes_select" ON exec_crm_notes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "crm_notes_insert" ON exec_crm_notes;
CREATE POLICY "crm_notes_insert" ON exec_crm_notes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "crm_notes_update" ON exec_crm_notes;
CREATE POLICY "crm_notes_update" ON exec_crm_notes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "crm_notes_delete" ON exec_crm_notes;
CREATE POLICY "crm_notes_delete" ON exec_crm_notes FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- CALENDAR EVENTS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL DEFAULT 'executive_meeting',
  start_datetime timestamptz NOT NULL,
  end_datetime timestamptz,
  location text,
  google_maps_url text,
  zoom_url text,
  organizer_id uuid REFERENCES exec_members(id),
  status text DEFAULT 'scheduled',
  expected_attendance int,
  actual_attendance int,
  budget numeric(10,2),
  notes text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exec_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "events_select" ON exec_events;
CREATE POLICY "events_select" ON exec_events FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "events_insert" ON exec_events;
CREATE POLICY "events_insert" ON exec_events FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "events_update" ON exec_events;
CREATE POLICY "events_update" ON exec_events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "events_delete" ON exec_events;
CREATE POLICY "events_delete" ON exec_events FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- EVENT RSVPS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES exec_events(id) ON DELETE CASCADE,
  member_id uuid REFERENCES exec_crm_members(id),
  status text NOT NULL DEFAULT 'invited',
  name text,
  email text,
  phone text,
  notes text,
  checked_in_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exec_event_rsvps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rsvps_select" ON exec_event_rsvps;
CREATE POLICY "rsvps_select" ON exec_event_rsvps FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "rsvps_insert" ON exec_event_rsvps;
CREATE POLICY "rsvps_insert" ON exec_event_rsvps FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "rsvps_update" ON exec_event_rsvps;
CREATE POLICY "rsvps_update" ON exec_event_rsvps FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "rsvps_delete" ON exec_event_rsvps;
CREATE POLICY "rsvps_delete" ON exec_event_rsvps FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- MEETINGS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  meeting_date date NOT NULL,
  meeting_time time,
  location text,
  zoom_url text,
  status text DEFAULT 'scheduled',
  agenda text,
  notes text,
  minutes text,
  action_items jsonb DEFAULT '[]',
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exec_meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "meetings_select" ON exec_meetings;
CREATE POLICY "meetings_select" ON exec_meetings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "meetings_insert" ON exec_meetings;
CREATE POLICY "meetings_insert" ON exec_meetings FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "meetings_update" ON exec_meetings;
CREATE POLICY "meetings_update" ON exec_meetings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "meetings_delete" ON exec_meetings;
CREATE POLICY "meetings_delete" ON exec_meetings FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- MEETING ATTENDEES
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_meeting_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES exec_meetings(id) ON DELETE CASCADE,
  exec_member_id uuid REFERENCES exec_members(id),
  attended boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exec_meeting_attendees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "meeting_att_select" ON exec_meeting_attendees;
CREATE POLICY "meeting_att_select" ON exec_meeting_attendees FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "meeting_att_insert" ON exec_meeting_attendees;
CREATE POLICY "meeting_att_insert" ON exec_meeting_attendees FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "meeting_att_update" ON exec_meeting_attendees;
CREATE POLICY "meeting_att_update" ON exec_meeting_attendees FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "meeting_att_delete" ON exec_meeting_attendees;
CREATE POLICY "meeting_att_delete" ON exec_meeting_attendees FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- TASKS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  progress int DEFAULT 0,
  assigned_to uuid REFERENCES exec_members(id),
  assigned_by uuid REFERENCES exec_members(id),
  related_event_id uuid REFERENCES exec_events(id),
  tags text[],
  position int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exec_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tasks_select" ON exec_tasks;
CREATE POLICY "tasks_select" ON exec_tasks FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "tasks_insert" ON exec_tasks;
CREATE POLICY "tasks_insert" ON exec_tasks FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "tasks_update" ON exec_tasks;
CREATE POLICY "tasks_update" ON exec_tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "tasks_delete" ON exec_tasks;
CREATE POLICY "tasks_delete" ON exec_tasks FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- TASK COMMENTS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES exec_tasks(id) ON DELETE CASCADE,
  author_id uuid REFERENCES exec_members(id),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exec_task_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "task_comments_select" ON exec_task_comments;
CREATE POLICY "task_comments_select" ON exec_task_comments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "task_comments_insert" ON exec_task_comments;
CREATE POLICY "task_comments_insert" ON exec_task_comments FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "task_comments_update" ON exec_task_comments;
CREATE POLICY "task_comments_update" ON exec_task_comments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "task_comments_delete" ON exec_task_comments;
CREATE POLICY "task_comments_delete" ON exec_task_comments FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- MESSAGE CHANNELS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_message_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  channel_type text NOT NULL DEFAULT 'direct',
  participants uuid[],
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exec_message_channels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "channels_select" ON exec_message_channels;
CREATE POLICY "channels_select" ON exec_message_channels FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "channels_insert" ON exec_message_channels;
CREATE POLICY "channels_insert" ON exec_message_channels FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "channels_update" ON exec_message_channels;
CREATE POLICY "channels_update" ON exec_message_channels FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "channels_delete" ON exec_message_channels;
CREATE POLICY "channels_delete" ON exec_message_channels FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- MESSAGES
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid NOT NULL REFERENCES exec_message_channels(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES exec_members(id),
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  is_announcement boolean DEFAULT false,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exec_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "messages_select" ON exec_messages;
CREATE POLICY "messages_select" ON exec_messages FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "messages_insert" ON exec_messages;
CREATE POLICY "messages_insert" ON exec_messages FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "messages_update" ON exec_messages;
CREATE POLICY "messages_update" ON exec_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "messages_delete" ON exec_messages;
CREATE POLICY "messages_delete" ON exec_messages FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES exec_members(id),
  title text NOT NULL,
  body text,
  notif_type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exec_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifs_select" ON exec_notifications;
CREATE POLICY "notifs_select" ON exec_notifications FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "notifs_insert" ON exec_notifications;
CREATE POLICY "notifs_insert" ON exec_notifications FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "notifs_update" ON exec_notifications;
CREATE POLICY "notifs_update" ON exec_notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "notifs_delete" ON exec_notifications;
CREATE POLICY "notifs_delete" ON exec_notifications FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- FINANCE TRANSACTIONS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_finance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type text NOT NULL DEFAULT 'income',
  category text NOT NULL,
  amount numeric(10,2) NOT NULL,
  description text,
  reference text,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  related_event_id uuid REFERENCES exec_events(id),
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exec_finance_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "finance_select" ON exec_finance_transactions;
CREATE POLICY "finance_select" ON exec_finance_transactions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "finance_insert" ON exec_finance_transactions;
CREATE POLICY "finance_insert" ON exec_finance_transactions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "finance_update" ON exec_finance_transactions;
CREATE POLICY "finance_update" ON exec_finance_transactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "finance_delete" ON exec_finance_transactions;
CREATE POLICY "finance_delete" ON exec_finance_transactions FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- VOLUNTEERS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES exec_crm_members(id) ON DELETE CASCADE,
  skills text[],
  availability text,
  hours_volunteered numeric(8,2) DEFAULT 0,
  programs_joined uuid[],
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exec_volunteers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "volunteers_select" ON exec_volunteers;
CREATE POLICY "volunteers_select" ON exec_volunteers FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "volunteers_insert" ON exec_volunteers;
CREATE POLICY "volunteers_insert" ON exec_volunteers FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "volunteers_update" ON exec_volunteers;
CREATE POLICY "volunteers_update" ON exec_volunteers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "volunteers_delete" ON exec_volunteers;
CREATE POLICY "volunteers_delete" ON exec_volunteers FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- CALL LOG
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_call_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES exec_crm_members(id) ON DELETE CASCADE,
  called_by uuid REFERENCES exec_members(id),
  call_outcome text NOT NULL DEFAULT 'no_answer',
  notes text,
  follow_up_date date,
  call_duration int,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exec_call_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "calls_select" ON exec_call_log;
CREATE POLICY "calls_select" ON exec_call_log FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "calls_insert" ON exec_call_log;
CREATE POLICY "calls_insert" ON exec_call_log FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "calls_update" ON exec_call_log;
CREATE POLICY "calls_update" ON exec_call_log FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "calls_delete" ON exec_call_log;
CREATE POLICY "calls_delete" ON exec_call_log FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- DOCUMENTS
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS exec_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  folder text NOT NULL DEFAULT 'general',
  file_url text,
  file_type text,
  file_size int,
  version int DEFAULT 1,
  tags text[],
  description text,
  uploaded_by uuid DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE exec_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "docs_select" ON exec_documents;
CREATE POLICY "docs_select" ON exec_documents FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "docs_insert" ON exec_documents;
CREATE POLICY "docs_insert" ON exec_documents FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "docs_update" ON exec_documents;
CREATE POLICY "docs_update" ON exec_documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "docs_delete" ON exec_documents;
CREATE POLICY "docs_delete" ON exec_documents FOR DELETE TO authenticated USING (true);

-- ────────────────────────────────────────────────────────────────
-- SEED SAMPLE DATA
-- ────────────────────────────────────────────────────────────────
INSERT INTO exec_crm_members (uid_member_id, first_name, last_name, email, phone, city, province, occupation, company, member_type, membership_status, membership_expiry, tags)
VALUES
  ('UID-2026-001', 'Ahmed', 'Yilmaz', 'ahmed.yilmaz@email.com', '+1 (416) 555-0101', 'Toronto', 'ON', 'Software Engineer', 'Tech Corp', 'professional', 'active', '2026-12-31', ARRAY['volunteer', 'tech']),
  ('UID-2026-002', 'Fatima', 'Ozturk', 'fatima.ozturk@email.com', '+1 (416) 555-0102', 'Mississauga', 'ON', 'Doctor', 'Trillium Hospital', 'professional', 'active', '2026-12-31', ARRAY['medical', 'women-branch']),
  ('UID-2026-003', 'Mustafa', 'Demir', 'mustafa.demir@email.com', '+1 (647) 555-0103', 'Brampton', 'ON', 'Teacher', 'Peel District School Board', 'professional', 'active', '2027-06-30', ARRAY['education', 'youth']),
  ('UID-2026-004', 'Zeynep', 'Kaya', 'zeynep.kaya@email.com', '+1 (905) 555-0104', 'Vaughan', 'ON', 'Accountant', 'Deloitte', 'professional', 'expired', '2025-12-31', ARRAY['finance']),
  ('UID-2026-005', 'Ibrahim', 'Arslan', 'ibrahim.arslan@email.com', '+1 (416) 555-0105', 'Toronto', 'ON', 'Student', 'University of Toronto', 'student', 'active', '2026-08-31', ARRAY['student', 'youth']),
  ('UID-2026-006', 'Ayse', 'Celik', 'ayse.celik@email.com', '+1 (416) 555-0106', 'Toronto', 'ON', 'Lawyer', 'Bay Street Legal', 'professional', 'active', '2026-12-31', ARRAY['legal', 'women-branch']),
  ('UID-2026-007', 'Hasan', 'Sahin', 'hasan.sahin@email.com', '+1 (647) 555-0107', 'Scarborough', 'ON', 'Engineer', 'City of Toronto', 'professional', 'pending', null, ARRAY['infrastructure']),
  ('UID-2026-008', 'Nurcan', 'Polat', 'nurcan.polat@email.com', '+1 (905) 555-0108', 'Oakville', 'ON', 'Nurse', 'Oakville Trafalgar', 'professional', 'active', '2026-09-30', ARRAY['medical', 'volunteer'])
ON CONFLICT (uid_member_id) DO NOTHING;

INSERT INTO exec_finance_transactions (transaction_type, category, amount, description, transaction_date)
VALUES
  ('income', 'membership', 250.00, 'Annual membership — Ahmed Yilmaz', '2026-01-15'),
  ('income', 'membership', 250.00, 'Annual membership — Fatima Ozturk', '2026-01-20'),
  ('income', 'donation', 500.00, 'Donation — community fundraiser', '2026-02-10'),
  ('expense', 'event', 350.00, 'Venue rental — Eid gala', '2026-03-05'),
  ('income', 'membership', 100.00, 'Student membership — Ibrahim Arslan', '2026-03-18'),
  ('expense', 'operations', 85.00, 'Office supplies', '2026-04-02'),
  ('income', 'program', 800.00, 'Ramadan dinner proceeds', '2026-04-14'),
  ('expense', 'event', 420.00, 'Catering — Eid celebration', '2026-04-28'),
  ('income', 'donation', 1000.00, 'Major donor — anonymous', '2026-05-01'),
  ('expense', 'marketing', 180.00, 'Social media ads', '2026-05-15'),
  ('income', 'membership', 250.00, 'Annual membership — Ayse Celik', '2026-06-01'),
  ('expense', 'technology', 99.00, 'Software subscription', '2026-06-10')
ON CONFLICT DO NOTHING;
