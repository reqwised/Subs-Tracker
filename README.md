# Ledger — Subscription Tracker (Supabase + Multi-user)

A dashboard for tracking software/tool subscriptions and their renewal schedules. Built with **React + Vite + Tailwind** on the frontend and **Supabase (Postgres + Auth + Realtime)** on the backend.

All authenticated users share and manage **the same subscription list** (ideal for a team dashboard), and changes are synchronized in real time across all connected users.

## Dashboard
<img width="900" alt="image" src="https://github.com/user-attachments/assets/25e3be23-a1ce-49f2-8f61-879057ebb14d" />

---

## 1. Create a Supabase Project

1. Go to **https://supabase.com** and create a **New Project**.
2. Save the following values from **Project Settings → API**:

   * **Project URL**
   * **Anon Public Key**

These values are required in Step 4.

---

## 2. Run the SQL Schema

1. Open **Supabase Dashboard → SQL Editor → New Query**.
2. Copy the contents of `supabase/schema.sql` from this project, paste it into the editor, and click **Run**.

The script will create:

* `subscriptions` table (`name`, `department`, `renewal_date`, `monthly_cost`, `status`, `notes`, `created_by`, timestamps)
* Trigger to automatically update `updated_at`
* Row Level Security (RLS) policies that allow any **authenticated** user to select, insert, update, and delete rows, since this is a **shared team dashboard** rather than a private per-user application
* Realtime enabled on the table so all users receive live updates
* 5 sample records (optional; remove them from the script if not needed)

---

## 3. Create 3 Test Users

The easiest method is through the Supabase Dashboard (do not insert directly into `auth.users`, as it is an internal Supabase table).

1. Open **Authentication → Users → Add User → Create New User**.
2. Enter an email and password, then **enable “Auto Confirm User”** so email verification is not required during testing.
3. Repeat for three accounts, for example:

| Email                                           | Password    |
| ----------------------------------------------- | ----------- |
| [tester1@ledger.app](mailto:tester1@ledger.app) | Testing123! |
| [tester2@ledger.app](mailto:tester2@ledger.app) | Testing123! |
| [tester3@ledger.app](mailto:tester3@ledger.app) | Testing123! |

These users can log in simultaneously from different devices and will see the same shared data in real time.

> If you later want public self-registration instead of only the three manually created accounts, enable email confirmation again in **Authentication → Settings** and add a sign-up flow to the application. The current app only includes a sign-in form for testing purposes.

---

## 4. Configure Local Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 5. Run the App Locally

```bash
npm install
npm run dev
```

Open **http://localhost:5173** and sign in using one of the test accounts created in Step 3.

---

## 6. Deploy to Vercel

Deploy as usual (import the GitHub repository or use the `vercel` CLI). One additional step is required: configure the production environment variables.

1. In your Vercel project, open **Settings → Environment Variables**.
2. Add:

   * `VITE_SUPABASE_URL` = your Supabase project URL
   * `VITE_SUPABASE_ANON_KEY` = your Supabase anon public key
3. Redeploy the project (or perform the first deployment after adding the variables).

The **anon public key is safe to expose in the frontend**. Data access is protected by **Row Level Security (RLS)** in the database, not by hiding this key.

---

## Features

* Multi-user authentication (Supabase Auth)
* Shared subscription data with real-time synchronization (Supabase Realtime)
* Create, edit, and delete subscriptions
* Automatic status calculation (**Active**, **Expiring Soon**, **Expired**, **Cancelled**) based on the renewal date, unless manually overridden to **Cancelled**
* Dashboard summary:

  * Total subscriptions
  * Active subscriptions
  * Expiring soon
  * Expired
  * Monthly spending
* Search, status filtering, and column sorting
* Visual indicators for subscriptions renewing within **14 days**
* CSV export

---

## Security Notes (RLS)

The current RLS policy allows **any authenticated user to read and modify all rows**, which matches the shared-dashboard requirement for the three test users.

If you later need **department-level access control** (for example, Department A cannot edit subscriptions belonging to Department B), you can update the policies in `supabase/schema.sql` to:

* check the `department` field directly, or
* create a `user_departments` table and filter access using RLS `USING (...)` conditions.

This architecture is already compatible with that future enhancement; only the RLS policies need to be adjusted.
