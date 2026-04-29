-- Supabase Production Schema for SlotIQ

-- Enable Postgres extensions
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table public.users (
  id uuid references auth.users not null primary key,
  email text unique,
  phone text unique,
  full_name text,
  city text,
  avatar_url text,
  role text,
  profile_completed boolean default false,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Note: Ensure Row Level Security (RLS) is enabled and appropriate policies are set.
alter table public.users enable row level security;
create policy "Users can view own profile." on public.users for select using ( auth.uid() = id );
create policy "Users can insert own profile." on public.users for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on public.users for update using ( auth.uid() = id );

-- 2. Vehicles Table
create table public.vehicles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type text not null, -- 'car' or 'bike'
  plate_number text not null,
  nickname text,
  is_ev boolean default false,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.vehicles enable row level security;
create policy "Users can view own vehicles." on public.vehicles for select using ( auth.uid() = user_id );
create policy "Users can insert own vehicles." on public.vehicles for insert with check ( auth.uid() = user_id );
create policy "Users can update own vehicles." on public.vehicles for update using ( auth.uid() = user_id );
create policy "Users can delete own vehicles." on public.vehicles for delete using ( auth.uid() = user_id );

-- 3. Listings Table
create table public.listings (
  id uuid default uuid_generate_v4() primary key,
  host_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  type text not null, -- 'Residential', 'Commercial', etc.
  google_maps_link text, -- The pasted Google Maps link
  address text,
  city text,
  area text,
  slots integer default 1,
  is_live boolean default true,
  lat numeric, -- Extracted optionally or populated later
  lng numeric,
  description text,
  rules text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.listings enable row level security;
create policy "Anyone can view live listings." on public.listings for select using ( is_live = true );
create policy "Hosts can view own listings." on public.listings for select using ( auth.uid() = host_id );
create policy "Hosts can insert listings." on public.listings for insert with check ( auth.uid() = host_id );
create policy "Hosts can update own listings." on public.listings for update using ( auth.uid() = host_id );

-- 4. Listing Pricing Table
create table public.listing_pricing (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  base_rate_per_hour numeric not null,
  surge_multiplier numeric default 1.0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.listing_pricing enable row level security;
create policy "Anyone can view pricing." on public.listing_pricing for select using ( true );
create policy "Hosts can manage pricing." on public.listing_pricing for all using ( auth.uid() in (select host_id from public.listings where id = listing_id) );

-- 5. Listing Photos Table
create table public.listing_photos (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.listing_photos enable row level security;
-- Note: Requires `listing_photos` bucket to exist in Supabase Storage.
create policy "Anyone can view photos." on public.listing_photos for select using ( true );
create policy "Hosts can manage photos." on public.listing_photos for all using ( auth.uid() in (select host_id from public.listings where id = listing_id) );

-- 6. Bookings Table
create table public.bookings (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.users(id) not null,
  listing_id uuid references public.listings(id) not null,
  vehicle_id uuid references public.vehicles(id) not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  total_price numeric not null,
  status text default 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  confirmation_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookings enable row level security;
create policy "Customers can view own bookings." on public.bookings for select using ( auth.uid() = customer_id );
create policy "Hosts can view bookings on own listings." on public.bookings for select using ( auth.uid() in (select host_id from public.listings where id = listing_id) );
create policy "Customers can insert bookings." on public.bookings for insert with check ( auth.uid() = customer_id );
create policy "Customers and Hosts can update bookings." on public.bookings for update using ( auth.uid() = customer_id or auth.uid() in (select host_id from public.listings where id = listing_id) );
