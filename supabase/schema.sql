-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run

-- 1. Table
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text not null,
  renewal_date date not null,
  monthly_cost numeric(10, 2) not null default 0,
  status text not null default 'Active',
  notes text default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Keep updated_at fresh on every edit
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute procedure public.set_updated_at();

-- 3. Row Level Security
-- All 3 test users share ONE subscriptions list (team dashboard), so every
-- signed-in user may read/write every row. Only "must be logged in" is enforced.
alter table public.subscriptions enable row level security;

drop policy if exists "authenticated can select" on public.subscriptions;
create policy "authenticated can select"
on public.subscriptions for select
to authenticated
using (true);

drop policy if exists "authenticated can insert" on public.subscriptions;
create policy "authenticated can insert"
on public.subscriptions for insert
to authenticated
with check (true);

drop policy if exists "authenticated can update" on public.subscriptions;
create policy "authenticated can update"
on public.subscriptions for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated can delete" on public.subscriptions;
create policy "authenticated can delete"
on public.subscriptions for delete
to authenticated
using (true);

-- 4. Enable Realtime so all users see live updates (also toggle this in
--    Dashboard -> Database -> Replication -> supabase_realtime if it doesn't apply here)
alter publication supabase_realtime add table public.subscriptions;

-- 5. Optional: seed a few rows to start with (safe to skip / edit)
insert into public.subscriptions (name, department, renewal_date, monthly_cost, status, notes)
values
  ('Figma', 'Design', current_date + interval '9 day', 45, 'Active', 'Org plan, 6 seats'),
  ('Slack', 'Operations', current_date + interval '40 day', 120, 'Active', 'Business+ plan'),
  ('Notion', 'Product', current_date + interval '3 day', 32, 'Active', ''),
  ('Adobe Creative Cloud', 'Marketing', current_date - interval '5 day', 89, 'Active', 'Renewal payment failed'),
  ('GitHub Enterprise', 'Engineering', current_date + interval '120 day', 210, 'Active', '20 seats');
