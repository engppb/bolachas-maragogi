create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  flavor text not null,
  weight_grams integer,
  price numeric(10, 2),
  description text not null default '',
  image text,
  image_alt text not null default '',
  accent text not null default '#b58a12',
  enabled boolean not null default true,
  category text not null default '',
  sort_order integer not null default 0,
  gallery jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint products_weight_positive check (weight_grams is null or weight_grams > 0),
  constraint products_price_nonnegative check (price is null or price >= 0),
  constraint products_gallery_array check (jsonb_typeof(gallery) = 'array')
);

create table if not exists public.store_settings (
  id integer primary key check (id = 1),
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  image text not null default '',
  href text not null default '',
  enabled boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_store_admin() from public;
grant execute on function public.is_store_admin() to anon, authenticated;

alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.store_settings enable row level security;
alter table public.banners enable row level security;

grant select on public.admin_users to authenticated;
grant select on public.products, public.store_settings, public.banners to anon, authenticated;
grant insert, update, delete on public.products, public.store_settings, public.banners to authenticated;

drop policy if exists "Admin can read own membership" on public.admin_users;
create policy "Admin can read own membership" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Public can read enabled products" on public.products;
create policy "Public can read enabled products" on public.products
  for select to anon, authenticated using (enabled or (select public.is_store_admin()));

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
  for all to authenticated using ((select public.is_store_admin()))
  with check ((select public.is_store_admin()));

drop policy if exists "Public can read store settings" on public.store_settings;
create policy "Public can read store settings" on public.store_settings
  for select to anon, authenticated using (true);

drop policy if exists "Admins manage store settings" on public.store_settings;
create policy "Admins manage store settings" on public.store_settings
  for all to authenticated using ((select public.is_store_admin()))
  with check ((select public.is_store_admin()));

drop policy if exists "Public can read enabled banners" on public.banners;
create policy "Public can read enabled banners" on public.banners
  for select to anon, authenticated using (enabled or (select public.is_store_admin()));

drop policy if exists "Admins manage banners" on public.banners;
create policy "Admins manage banners" on public.banners
  for all to authenticated using ((select public.is_store_admin()))
  with check ((select public.is_store_admin()));

create or replace function public.publish_store_content(
  p_products jsonb,
  p_settings jsonb,
  p_banners jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (select public.is_store_admin()) then
    raise exception 'Administrator authorization required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_products) is distinct from 'array'
     or jsonb_typeof(p_settings) is distinct from 'object'
     or jsonb_typeof(p_banners) is distinct from 'array' then
    raise exception 'Invalid store content payload' using errcode = '22023';
  end if;

  insert into public.products (
    id, flavor, weight_grams, price, description, image, image_alt,
    accent, enabled, category, sort_order, gallery, updated_at
  )
  select
    item.id, item.flavor, item.weight_grams, item.price, coalesce(item.description, ''),
    item.image, coalesce(item.image_alt, ''), coalesce(item.accent, '#b58a12'),
    coalesce(item.enabled, true), coalesce(item.category, ''), coalesce(item.sort_order, 0),
    coalesce(item.gallery, '[]'::jsonb), now()
  from jsonb_to_recordset(p_products) as item(
    id text, flavor text, weight_grams integer, price numeric,
    description text, image text, image_alt text, accent text, enabled boolean,
    category text, sort_order integer, gallery jsonb
  )
  on conflict (id) do update set
    flavor = excluded.flavor,
    weight_grams = excluded.weight_grams,
    price = excluded.price,
    description = excluded.description,
    image = excluded.image,
    image_alt = excluded.image_alt,
    accent = excluded.accent,
    enabled = excluded.enabled,
    category = excluded.category,
    sort_order = excluded.sort_order,
    gallery = excluded.gallery,
    updated_at = now();

  delete from public.products
  where not (id in (select item.id from jsonb_to_recordset(p_products) as item(id text)));

  insert into public.store_settings (id, settings, updated_at)
  values (1, p_settings, now())
  on conflict (id) do update set settings = excluded.settings, updated_at = now();

  insert into public.banners (id, title, image, href, enabled, sort_order, updated_at)
  select item.id::uuid, coalesce(item.title, ''), coalesce(item.image, ''),
         coalesce(item.href, ''), coalesce(item.enabled, true),
         coalesce(item.sort_order, 0), now()
  from jsonb_to_recordset(p_banners) as item(
    id text, title text, image text, href text, enabled boolean, sort_order integer
  )
  on conflict (id) do update set
    title = excluded.title,
    image = excluded.image,
    href = excluded.href,
    enabled = excluded.enabled,
    sort_order = excluded.sort_order,
    updated_at = now();

  delete from public.banners
  where not (id in (select item.id::uuid from jsonb_to_recordset(p_banners) as item(id text)));
end;
$$;

revoke all on function public.publish_store_content(jsonb, jsonb, jsonb) from public;
grant execute on function public.publish_store_content(jsonb, jsonb, jsonb) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('store-images', 'store-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update set public = true, file_size_limit = 10485760,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read store images" on storage.objects;
create policy "Public can read store images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'store-images');

drop policy if exists "Admins can upload store images" on storage.objects;
create policy "Admins can upload store images" on storage.objects
  for insert to authenticated with check (bucket_id = 'store-images' and (select public.is_store_admin()));

drop policy if exists "Admins can update store images" on storage.objects;
create policy "Admins can update store images" on storage.objects
  for update to authenticated using (bucket_id = 'store-images' and (select public.is_store_admin()))
  with check (bucket_id = 'store-images' and (select public.is_store_admin()));

drop policy if exists "Admins can delete store images" on storage.objects;
create policy "Admins can delete store images" on storage.objects
  for delete to authenticated using (bucket_id = 'store-images' and (select public.is_store_admin()));

do $$
begin
  alter publication supabase_realtime add table public.products;
exception
  when duplicate_object or undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.store_settings;
exception
  when duplicate_object or undefined_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.banners;
exception
  when duplicate_object or undefined_object then null;
end $$;
