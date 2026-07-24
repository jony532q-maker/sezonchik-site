-- СЕЗОНЩИК V7.0 — безопасная настройка базы и хранилища
alter table public.products add column if not exists title text;
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists category text default 'bicycles';
alter table public.products add column if not exists product_type text default 'adult';
alter table public.products add column if not exists price integer default 0;
alter table public.products add column if not exists old_price integer;
alter table public.products add column if not exists wheel_size text;
alter table public.products add column if not exists frame_size text;
alter table public.products add column if not exists frame_material text;
alter table public.products add column if not exists brakes text;
alter table public.products add column if not exists speeds integer;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists image text;
alter table public.products add column if not exists gallery jsonb default '[]'::jsonb;
alter table public.products add column if not exists in_stock boolean default true;
alter table public.products add column if not exists featured boolean default false;
alter table public.products add column if not exists bestseller boolean default false;
alter table public.products add column if not exists sort_order integer default 0;
alter table public.products add column if not exists published boolean default true;

alter table public.products enable row level security;

drop policy if exists "Public read published products" on public.products;
create policy "Public read published products" on public.products
for select to anon, authenticated using (published = true or auth.role() = 'authenticated');

drop policy if exists "Authenticated insert products" on public.products;
create policy "Authenticated insert products" on public.products
for insert to authenticated with check (true);

drop policy if exists "Authenticated update products" on public.products;
create policy "Authenticated update products" on public.products
for update to authenticated using (true) with check (true);

drop policy if exists "Authenticated delete products" on public.products;
create policy "Authenticated delete products" on public.products
for delete to authenticated using (true);

-- Хранилище products: публичное чтение, запись только после входа.
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects
for select to public using (bucket_id = 'products');

drop policy if exists "Authenticated upload product images" on storage.objects;
create policy "Authenticated upload product images" on storage.objects
for insert to authenticated with check (bucket_id = 'products');

drop policy if exists "Authenticated update product images" on storage.objects;
create policy "Authenticated update product images" on storage.objects
for update to authenticated using (bucket_id = 'products') with check (bucket_id = 'products');

drop policy if exists "Authenticated delete product images" on storage.objects;
create policy "Authenticated delete product images" on storage.objects
for delete to authenticated using (bucket_id = 'products');

create unique index if not exists products_slug_unique on public.products(slug) where slug is not null;
create index if not exists products_category_idx on public.products(category);
create index if not exists products_sort_idx on public.products(sort_order);
