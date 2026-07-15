create table if not exists public.souvenir_works (
  id uuid primary key default gen_random_uuid(),
  token uuid not null unique,
  image_path text not null,
  player_name varchar(20) not null,
  theme_id varchar(80) not null,
  fragment_ids text[] not null default '{}',
  source_ids text[] not null default '{}',
  favorite_fragment_id varchar(80),
  expression_title varchar(40) not null default '',
  expression_text varchar(240) not null default '',
  generated_by_ai boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  constraint souvenir_fragment_limit check (cardinality(fragment_ids) <= 3),
  constraint souvenir_source_limit check (cardinality(source_ids) <= 3)
);

alter table public.souvenir_works enable row level security;
revoke all on table public.souvenir_works from anon, authenticated;

create index if not exists souvenir_works_expires_at_idx on public.souvenir_works (expires_at);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('souvenirs', 'souvenirs', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
