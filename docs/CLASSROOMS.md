# Virtual Classrooms

Google-Classroom-style classes inside AccrualSense, backed by Supabase. Multi-teacher by
design: Dr. Desai (admin) can promote any signed-up user to **teacher**, and every teacher
owns and runs their own classrooms.

## Setup (one-time)

1. Run `supabase/schema.sql` first (profiles + doubts — already done if the admin surface works).
2. Run `supabase/classrooms.sql` in Supabase → SQL Editor. Idempotent; purely additive.

## Roles

| Role | How they get it | What they can do |
| --- | --- | --- |
| `student` | default on sign-up | join classes via code/link, post*/comment, leave |
| `teacher` | Admin → `/admin` → Users → **Make teacher** | create classes, full control inside their own classes |
| `admin` | one-time SQL (see `docs/ADMIN.md`) | everything a teacher can, in **every** class + promote/demote teachers |

\* students can post to a class stream only while the class has "Students can post" on (teacher
toggle, default on). Comments (doubts under a post) are always open to members.

Demoting a teacher keeps their existing classes working (ownership is by user id, not role) —
they just can't create new ones.

## How it works

- **Create:** a teacher opens `/classrooms` → New classroom. A 6-character join code is
  generated server-side (unambiguous alphabet — no 0/O or 1/I).
- **Invite:** Classroom → People → *Invite students*: copy the join link
  (`/classrooms/join/CODE`, WhatsApp-friendly) or share the code. Students never see the code.
- **Join:** the link shows a preview (class, teacher, member count) → confirm. Joining goes
  ONLY through the `join_classroom()` RPC — there is deliberately no insert policy on the
  members table, so codes can't be abused by writing rows directly.
- **Stream:** teacher announcements + (optionally) student posts; threaded comments for
  doubts. Authors can delete their own; the teacher can delete anything in their class.
- **People:** roster with join dates (emails visible to the teacher only); teacher removes
  members; students can leave.
- **Settings (teacher):** edit details, toggle student posts, **archive** (read-only, no new
  joins — enforced by RLS, not just UI), delete (cascades posts/comments/roster).

## Security model (all server-side RLS — verified adversarially 19 Jul 2026)

- Non-members read **zero rows** from classrooms/posts/members; the UI shows an honest
  "not available" page.
- Students cannot: create/rename classes, delete teacher posts, insert memberships directly,
  post to archived classes, or self-promote (`profiles.role` is column-revoked; the
  `set_user_role()` RPC is admin-gated and refuses to touch admin rows).
- Names/emails are snapshotted onto rows at write time because profiles are not
  cross-readable under RLS.

## Files

`supabase/classrooms.sql` · `src/lib/classrooms.ts` (data layer) · `src/lib/role.ts`
(`useMyRole`/`useIsTeacher`) · pages `Classrooms.tsx`, `ClassroomDetail.tsx`,
`JoinClassroom.tsx` · Admin promote UI in `src/pages/Admin.tsx`.

## Ideas for phase 2

Assignments that point at existing content (a quiz, a seeded Problem-Lab set — everyone gets
the identical sum) with an attempts table so scores reach the teacher's dashboard; Supabase
Realtime for a live stream.
