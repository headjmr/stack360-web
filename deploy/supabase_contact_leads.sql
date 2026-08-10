-- Stack360 — contact form lead store
-- Run in the Supabase SQL editor (or via migration) on the app's project.

create table if not exists public.contact_leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null,
  pe_company   text not null,
  title        text not null,
  city_country text not null,
  phone        text not null,
  work_email   text not null,
  source       text default 'landing',
  user_agent   text
);

create index if not exists contact_leads_created_at_idx on public.contact_leads (created_at desc);

-- RLS ON = deny by default. The /api/contact function writes with the SERVICE ROLE key,
-- which bypasses RLS, so the public/anon role gets NO read or write access at all.
alter table public.contact_leads enable row level security;
revoke all on public.contact_leads from anon, authenticated;

-- ALTERNATIVE (only if you POST straight from the browser with the ANON key instead of the
-- serverless function): allow anon INSERT, never SELECT. Leave the block above commented out then.
-- create policy "anon can insert leads" on public.contact_leads
--   for insert to anon with check (true);
