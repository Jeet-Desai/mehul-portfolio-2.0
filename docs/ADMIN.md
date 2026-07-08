# Admin surface — answer doubts + see your users

Dr. Desai gets a private **`/admin`** page with two tabs:

- **Doubts** — every doubt students post lands here. Type an answer and it publishes
  to the public **Answered doubts** feed on `/ask` for everyone to learn from.
- **Users** — how many people have signed up, how many are new this week / active
  today, and the full list (name, email, joined, last seen).

This rides on top of the existing Supabase login (see `AUTH.md`). It stays **dormant
until keyed** — with no Supabase keys, the whole feature is invisible and `/ask`
keeps its old on-device Doubt Box.

## One-time setup (~5 minutes)

You need the Supabase project from `AUTH.md` already created and keyed.

### 1. Create the tables

Supabase dashboard → **SQL Editor** → **New query** → paste the whole of
[`supabase/schema.sql`](../supabase/schema.sql) → **Run**. It is safe to re-run.

This creates:
- `profiles` — one row per user (auto-filled on sign-up; the browser can't read
  `auth.users` directly, so we mirror the basics here).
- `doubts` — the shared doubt queue.
- Row-Level Security so only the admin can read the user list or answer doubts,
  while **answered** doubts are public.

### 2. Make Dr. Desai the admin

He must **sign in once first** (so his `profiles` row exists). Then, in the SQL
Editor, run — with his real email:

```sql
update public.profiles set role = 'admin' where email = 'mehul@example.com';
```

> Tip: if he signs in with Google and email/password separately, those are two
> different accounts. Pick one email and use it everywhere below.

### 3. Point the app at that email

Add one env var (Vercel → **Settings → Environment Variables**, Production +
Preview; and your local `.env`):

```
VITE_ADMIN_EMAIL=mehul@example.com
```

Use the **same** email as the `role='admin'` row. This var only decides who *sees*
the Admin link and page; the `role='admin'` row + RLS is what actually grants
access to the data. Both must agree.

### 4. Redeploy

`VITE_`-prefixed vars are read at **build time**, so redeploy after adding it.
Sign in as Dr. Desai → an **Admin** link appears in the nav → open it.

## Day-to-day

- **Answering a doubt:** Admin → **Doubts** → *Pending* → write the answer →
  **Post answer**. It flips to *Answered* and shows up publicly on `/ask` under
  "Answered doubts", attributed to Dr. Desai. You can **Edit** or **Delete** any
  answer later.
- **Users:** Admin → **Users** → four counters + a searchable table. "Active today"
  counts anyone whose app loaded in the last 24h; "Last seen" updates each time a
  signed-in user opens the site.

## Security notes

- Only the **anon (public)** key ships in the browser — never the service-role key.
- Real protection is **Row-Level Security** (in `schema.sql`), keyed on
  `is_admin()`. Even if someone forged the client-side admin check, RLS returns
  **zero rows** unless their own `profiles.role = 'admin'`.
- Students can only post doubts as themselves and read their own + answered ones.
- Changing a user's `role` is only possible from the Supabase SQL editor, never
  from the app.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| No **Admin** link after signing in | `VITE_ADMIN_EMAIL` not set / doesn't match the signed-in email, or not redeployed. |
| Admin page loads but lists are empty with an error | `supabase/schema.sql` not run, or the `role='admin'` row not set for this account. |
| "Answered doubts" don't appear on `/ask` | The doubt is still *Pending* — answer it in Admin → Doubts. |
| Posting a doubt errors | The student isn't signed in, or `schema.sql`'s `doubts` policies weren't applied. |
