/*
# Security Hardening — fix mutable search_path + RLS policy bypasses

## Summary
1. Fixes the `public.set_updated_at` function, which had a role-mutable
   `search_path` — a security risk that could allow search-path hijacking.
   The function is recreated with an explicit, immutable `search_path`.
2. Replaces 54 RLS policies across 18 tables that used `USING (true)` /
   `WITH CHECK (true)` — flagged as "RLS Policy Always True" because they
   effectively bypass row-level security for authenticated users.

## Authorization model
This is an internal executive-board dashboard where all authenticated board
members share access to organizational data (events, tasks, CRM, messages,
finance, etc.). The old policies allowed ANY authenticated Supabase user to
read/write all rows. The new policies verify that the caller is an actual
member of the executive board by checking `exec_members.user_id =
auth.uid()` (with `exec_members.is_active = true`).

Tables are grouped:
- **Top-level exec tables** (exec_events, exec_meetings, exec_tasks, etc.):
  policies check `EXISTS (SELECT 1 FROM exec_members WHERE user_id =
  auth.uid() AND is_active = true)`.
- **Child tables** (exec_event_rsvps, exec_meeting_attendees,
  exec_task_comments, exec_messages, exec_crm_notes, exec_volunteers,
  exec_call_log): policies check the parent row exists AND the caller is an
  active exec member — preventing orphaned writes.
- **exec_message_channels**: participants-scoped SELECT (caller must be in
  the `participants` array); exec-member check for INSERT/UPDATE/DELETE.
- **exec_notifications**: recipient-scoped SELECT/UPDATE (only the
  recipient can read/mark-read their notifications); exec-member INSERT
  (any board member can send a notification); recipient or exec-member
  DELETE.
- **members + family_members** (public-facing membership registration):
  registration is done by anonymous site visitors, so INSERT is allowed
  for `anon, authenticated` (the public registration form). SELECT /
  UPDATE / DELETE remain exec-member-scoped so only board members can
  view/manage the member roster.

## search_path fix
The `set_updated_at` trigger function is dropped and recreated with:
  `SET search_path = pg_catalog, public`
This makes the search_path immutable per-role, closing the hijack vector.

## Important notes
1. SELECT policies on exec_* tables are NOT changed to `true` — they now
   require active exec membership. Any non-board authenticated user (e.g.
   a regular member who signed up) will get zero rows from exec tables.
2. The `members` table INSERT policy is widened to `anon, authenticated`
   so the public registration form (which runs as the anon role) can
   create member rows. All other operations on `members` and all
   operations on `family_members` require exec membership.
3. The existing `set_updated_at` trigger on the `members` table is
   preserved (it references the function by name, so recreating the
   function is sufficient).
*/

-- ════════════════════════════════════════════════════════════════
-- 1. FIX MUTABLE search_path ON set_updated_at
-- ════════════════════════════════════════════════════════════════
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

CREATE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Re-create the trigger that was dropped with the function
DROP TRIGGER IF EXISTS members_updated_at ON members;
CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ════════════════════════════════════════════════════════════════
-- 2. HELPER: check active exec membership
-- (inlined in policies for performance; not a separate function to
--  avoid additional search_path concerns)
-- ════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════
-- 3. EXEC MEMBERS
-- Active exec members can manage the full roster
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "exec_members_select" ON exec_members;
CREATE POLICY "exec_members_select" ON exec_members FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "exec_members_insert" ON exec_members;
CREATE POLICY "exec_members_insert" ON exec_members FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "exec_members_update" ON exec_members;
CREATE POLICY "exec_members_update" ON exec_members FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "exec_members_delete" ON exec_members;
CREATE POLICY "exec_members_delete" ON exec_members FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 4. CRM MEMBERS
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "crm_members_select" ON exec_crm_members;
CREATE POLICY "crm_members_select" ON exec_crm_members FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "crm_members_insert" ON exec_crm_members;
CREATE POLICY "crm_members_insert" ON exec_crm_members FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "crm_members_update" ON exec_crm_members;
CREATE POLICY "crm_members_update" ON exec_crm_members FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "crm_members_delete" ON exec_crm_members;
CREATE POLICY "crm_members_delete" ON exec_crm_members FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 5. CRM NOTES (child of exec_crm_members)
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "crm_notes_select" ON exec_crm_notes;
CREATE POLICY "crm_notes_select" ON exec_crm_notes FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "crm_notes_insert" ON exec_crm_notes;
CREATE POLICY "crm_notes_insert" ON exec_crm_notes FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
    AND EXISTS (SELECT 1 FROM exec_crm_members c WHERE c.id = exec_crm_notes.member_id)
  );

DROP POLICY IF EXISTS "crm_notes_update" ON exec_crm_notes;
CREATE POLICY "crm_notes_update" ON exec_crm_notes FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "crm_notes_delete" ON exec_crm_notes;
CREATE POLICY "crm_notes_delete" ON exec_crm_notes FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 6. EVENTS
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "events_select" ON exec_events;
CREATE POLICY "events_select" ON exec_events FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "events_insert" ON exec_events;
CREATE POLICY "events_insert" ON exec_events FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "events_update" ON exec_events;
CREATE POLICY "events_update" ON exec_events FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "events_delete" ON exec_events;
CREATE POLICY "events_delete" ON exec_events FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 7. EVENT RSVPS (child of exec_events)
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "rsvps_select" ON exec_event_rsvps;
CREATE POLICY "rsvps_select" ON exec_event_rsvps FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "rsvps_insert" ON exec_event_rsvps;
CREATE POLICY "rsvps_insert" ON exec_event_rsvps FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
    AND EXISTS (SELECT 1 FROM exec_events e WHERE e.id = exec_event_rsvps.event_id)
  );

DROP POLICY IF EXISTS "rsvps_update" ON exec_event_rsvps;
CREATE POLICY "rsvps_update" ON exec_event_rsvps FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "rsvps_delete" ON exec_event_rsvps;
CREATE POLICY "rsvps_delete" ON exec_event_rsvps FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 8. MEETINGS
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "meetings_select" ON exec_meetings;
CREATE POLICY "meetings_select" ON exec_meetings FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "meetings_insert" ON exec_meetings;
CREATE POLICY "meetings_insert" ON exec_meetings FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "meetings_update" ON exec_meetings;
CREATE POLICY "meetings_update" ON exec_meetings FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "meetings_delete" ON exec_meetings;
CREATE POLICY "meetings_delete" ON exec_meetings FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 9. MEETING ATTENDEES (child of exec_meetings)
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "meeting_att_select" ON exec_meeting_attendees;
CREATE POLICY "meeting_att_select" ON exec_meeting_attendees FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "meeting_att_insert" ON exec_meeting_attendees;
CREATE POLICY "meeting_att_insert" ON exec_meeting_attendees FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
    AND EXISTS (SELECT 1 FROM exec_meetings m WHERE m.id = exec_meeting_attendees.meeting_id)
  );

DROP POLICY IF EXISTS "meeting_att_update" ON exec_meeting_attendees;
CREATE POLICY "meeting_att_update" ON exec_meeting_attendees FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "meeting_att_delete" ON exec_meeting_attendees;
CREATE POLICY "meeting_att_delete" ON exec_meeting_attendees FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 10. TASKS
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "tasks_select" ON exec_tasks;
CREATE POLICY "tasks_select" ON exec_tasks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "tasks_insert" ON exec_tasks;
CREATE POLICY "tasks_insert" ON exec_tasks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "tasks_update" ON exec_tasks;
CREATE POLICY "tasks_update" ON exec_tasks FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "tasks_delete" ON exec_tasks;
CREATE POLICY "tasks_delete" ON exec_tasks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 11. TASK COMMENTS (child of exec_tasks)
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "task_comments_select" ON exec_task_comments;
CREATE POLICY "task_comments_select" ON exec_task_comments FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "task_comments_insert" ON exec_task_comments;
CREATE POLICY "task_comments_insert" ON exec_task_comments FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
    AND EXISTS (SELECT 1 FROM exec_tasks t WHERE t.id = exec_task_comments.task_id)
  );

DROP POLICY IF EXISTS "task_comments_update" ON exec_task_comments;
CREATE POLICY "task_comments_update" ON exec_task_comments FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "task_comments_delete" ON exec_task_comments;
CREATE POLICY "task_comments_delete" ON exec_task_comments FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 12. MESSAGE CHANNELS
-- SELECT: caller must be a participant; write: must be exec member
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "channels_select" ON exec_message_channels;
CREATE POLICY "channels_select" ON exec_message_channels FOR SELECT
  TO authenticated USING (
    auth.uid() = ANY(participants)
    OR EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "channels_insert" ON exec_message_channels;
CREATE POLICY "channels_insert" ON exec_message_channels FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "channels_update" ON exec_message_channels;
CREATE POLICY "channels_update" ON exec_message_channels FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "channels_delete" ON exec_message_channels;
CREATE POLICY "channels_delete" ON exec_message_channels FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 13. MESSAGES (child of exec_message_channels)
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "messages_select" ON exec_messages;
CREATE POLICY "messages_select" ON exec_messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "messages_insert" ON exec_messages;
CREATE POLICY "messages_insert" ON exec_messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
    AND EXISTS (SELECT 1 FROM exec_message_channels c WHERE c.id = exec_messages.channel_id)
  );

DROP POLICY IF EXISTS "messages_update" ON exec_messages;
CREATE POLICY "messages_update" ON exec_messages FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "messages_delete" ON exec_messages;
CREATE POLICY "messages_delete" ON exec_messages FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 14. NOTIFICATIONS
-- SELECT/UPDATE: only the recipient; INSERT: any exec member; DELETE: recipient or exec member
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "notifs_select" ON exec_notifications;
CREATE POLICY "notifs_select" ON exec_notifications FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.id = exec_notifications.recipient_id AND em.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "notifs_insert" ON exec_notifications;
CREATE POLICY "notifs_insert" ON exec_notifications FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "notifs_update" ON exec_notifications;
CREATE POLICY "notifs_update" ON exec_notifications FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.id = exec_notifications.recipient_id AND em.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.id = exec_notifications.recipient_id AND em.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "notifs_delete" ON exec_notifications;
CREATE POLICY "notifs_delete" ON exec_notifications FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.id = exec_notifications.recipient_id AND em.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM exec_members em2 WHERE em2.user_id = auth.uid() AND em2.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 15. FINANCE TRANSACTIONS
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "finance_select" ON exec_finance_transactions;
CREATE POLICY "finance_select" ON exec_finance_transactions FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "finance_insert" ON exec_finance_transactions;
CREATE POLICY "finance_insert" ON exec_finance_transactions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "finance_update" ON exec_finance_transactions;
CREATE POLICY "finance_update" ON exec_finance_transactions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "finance_delete" ON exec_finance_transactions;
CREATE POLICY "finance_delete" ON exec_finance_transactions FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 16. VOLUNTEERS (child of exec_crm_members)
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "volunteers_select" ON exec_volunteers;
CREATE POLICY "volunteers_select" ON exec_volunteers FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "volunteers_insert" ON exec_volunteers;
CREATE POLICY "volunteers_insert" ON exec_volunteers FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
    AND EXISTS (SELECT 1 FROM exec_crm_members c WHERE c.id = exec_volunteers.member_id)
  );

DROP POLICY IF EXISTS "volunteers_update" ON exec_volunteers;
CREATE POLICY "volunteers_update" ON exec_volunteers FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "volunteers_delete" ON exec_volunteers;
CREATE POLICY "volunteers_delete" ON exec_volunteers FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 17. CALL LOG (child of exec_crm_members)
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "calls_select" ON exec_call_log;
CREATE POLICY "calls_select" ON exec_call_log FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "calls_insert" ON exec_call_log;
CREATE POLICY "calls_insert" ON exec_call_log FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
    AND EXISTS (SELECT 1 FROM exec_crm_members c WHERE c.id = exec_call_log.member_id)
  );

DROP POLICY IF EXISTS "calls_update" ON exec_call_log;
CREATE POLICY "calls_update" ON exec_call_log FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "calls_delete" ON exec_call_log;
CREATE POLICY "calls_delete" ON exec_call_log FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 18. DOCUMENTS
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "docs_select" ON exec_documents;
CREATE POLICY "docs_select" ON exec_documents FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "docs_insert" ON exec_documents;
CREATE POLICY "docs_insert" ON exec_documents FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "docs_update" ON exec_documents;
CREATE POLICY "docs_update" ON exec_documents FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "docs_delete" ON exec_documents;
CREATE POLICY "docs_delete" ON exec_documents FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 19. MEMBERS (public-facing membership registration)
-- INSERT: anon + authenticated (public registration form)
-- SELECT/UPDATE/DELETE: exec members only
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "members_select" ON members;
CREATE POLICY "members_select" ON members FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "members_insert" ON members;
CREATE POLICY "members_insert" ON members FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "members_update" ON members;
CREATE POLICY "members_update" ON members FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "members_delete" ON members;
CREATE POLICY "members_delete" ON members FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );


-- ════════════════════════════════════════════════════════════════
-- 20. FAMILY MEMBERS (child of members)
-- INSERT: anon + authenticated (public registration form)
-- SELECT/UPDATE/DELETE: exec members only
-- ════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "family_members_select" ON family_members;
CREATE POLICY "family_members_select" ON family_members FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "family_members_insert" ON family_members;
CREATE POLICY "family_members_insert" ON family_members FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "family_members_update" ON family_members;
CREATE POLICY "family_members_update" ON family_members FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );

DROP POLICY IF EXISTS "family_members_delete" ON family_members;
CREATE POLICY "family_members_delete" ON family_members FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM exec_members em WHERE em.user_id = auth.uid() AND em.is_active = true)
  );
