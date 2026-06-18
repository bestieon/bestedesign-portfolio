create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text,
  year text,
  short_description text,
  description text,
  cover_image_path text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  image_path text not null,
  caption text,
  x numeric not null default 8,
  y numeric not null default 8,
  width numeric not null default 40,
  height numeric not null default 30,
  sort_order int not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.external_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  file_path text not null,
  file_type text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.settings(key, value) values
  ('hero_title', 'Industrial design portfolio with precision.'),
  ('hero_subtitle', 'A modern, editable portfolio system for product visuals, 1920×1080 compositions, and externally uploaded pages.'),
  ('about_text', 'Edit this biography from the admin panel. Built for industrial design process, product imagery, and refined visual storytelling.'),
  ('cv_url', ''),
  ('instagram_url', ''),
  ('linkedin_url', ''),
  ('hero_image_path', '')
on conflict (key) do nothing;

insert into public.projects(title, slug, category, year, short_description, description, sort_order, is_published) values
  ('Sample Product System', 'sample-product-system', 'Industrial Design', '2026', 'A placeholder project showing the portfolio structure.', 'Replace this with a real project from the admin panel. Add product images and tune their position from the image layout editor.', 1, true)
on conflict (slug) do nothing;

insert into storage.buckets(id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = excluded.public;

alter table public.admin_users enable row level security;
alter table public.settings enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.external_pages enable row level security;

drop policy if exists "public can read settings" on public.settings;
create policy "public can read settings" on public.settings for select using (true);

drop policy if exists "public can read published projects" on public.projects;
create policy "public can read published projects" on public.projects for select using (is_published = true or exists (select 1 from public.admin_users a where a.email = auth.email()));

drop policy if exists "public can read visible project images" on public.project_images;
create policy "public can read visible project images" on public.project_images for select using (is_visible = true or exists (select 1 from public.admin_users a where a.email = auth.email()));

drop policy if exists "public can read published external pages" on public.external_pages;
create policy "public can read published external pages" on public.external_pages for select using (is_published = true or exists (select 1 from public.admin_users a where a.email = auth.email()));

drop policy if exists "admin can read admin users" on public.admin_users;
create policy "admin can read admin users" on public.admin_users for select using (exists (select 1 from public.admin_users a where a.email = auth.email()));

drop policy if exists "admin can modify settings" on public.settings;
create policy "admin can modify settings" on public.settings for all using (exists (select 1 from public.admin_users a where a.email = auth.email())) with check (exists (select 1 from public.admin_users a where a.email = auth.email()));

drop policy if exists "admin can modify projects" on public.projects;
create policy "admin can modify projects" on public.projects for all using (exists (select 1 from public.admin_users a where a.email = auth.email())) with check (exists (select 1 from public.admin_users a where a.email = auth.email()));

drop policy if exists "admin can modify project images" on public.project_images;
create policy "admin can modify project images" on public.project_images for all using (exists (select 1 from public.admin_users a where a.email = auth.email())) with check (exists (select 1 from public.admin_users a where a.email = auth.email()));

drop policy if exists "admin can modify external pages" on public.external_pages;
create policy "admin can modify external pages" on public.external_pages for all using (exists (select 1 from public.admin_users a where a.email = auth.email())) with check (exists (select 1 from public.admin_users a where a.email = auth.email()));

drop policy if exists "public read portfolio files" on storage.objects;
create policy "public read portfolio files" on storage.objects for select using (bucket_id = 'portfolio');

drop policy if exists "admin upload portfolio files" on storage.objects;
create policy "admin upload portfolio files" on storage.objects for insert with check (bucket_id = 'portfolio' and exists (select 1 from public.admin_users a where a.email = auth.email()));

drop policy if exists "admin update portfolio files" on storage.objects;
create policy "admin update portfolio files" on storage.objects for update using (bucket_id = 'portfolio' and exists (select 1 from public.admin_users a where a.email = auth.email())) with check (bucket_id = 'portfolio' and exists (select 1 from public.admin_users a where a.email = auth.email()));

drop policy if exists "admin delete portfolio files" on storage.objects;
create policy "admin delete portfolio files" on storage.objects for delete using (bucket_id = 'portfolio' and exists (select 1 from public.admin_users a where a.email = auth.email()));
