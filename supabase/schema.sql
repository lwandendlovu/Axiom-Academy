-- Axiom Academy: table for form entries (run once in Supabase > SQL Editor)

create table if not exists public.submissions (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  type        text not null check (type in ('tutoring', 'mentorship')),
  data        jsonb not null,
  status      text not null default 'new' check (status in ('new', 'contacted', 'booked', 'closed'))
);

-- Row Level Security on, with no public policies:
-- only the server function (service role key) can read or write.
alter table public.submissions enable row level security;

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);
