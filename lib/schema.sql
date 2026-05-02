-- BiciCocina Database Schema
-- Paste this into the Supabase SQL Editor to create all tables

-- ============================================================
-- PROFILES — extends auth.users
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  preferred_language text default 'en',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Anyone can view profiles"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROUTES — bike routes
-- ============================================================
create table public.routes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  distance real,
  elevation real,
  coordinates jsonb,
  tags text[] default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.routes enable row level security;

create policy "Anyone can view routes"
  on public.routes for select using (true);

create policy "Authenticated users can create routes"
  on public.routes for insert with check (auth.uid() = created_by);

create policy "Users can update own routes"
  on public.routes for update using (auth.uid() = created_by);

-- ============================================================
-- RATINGS — structured rubric (5 categories, 1-5 each)
-- ============================================================
create table public.ratings (
  id uuid default gen_random_uuid() primary key,
  route_id uuid references public.routes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  safety smallint check (safety between 1 and 5),
  lighting smallint check (lighting between 1 and 5),
  beginner smallint check (beginner between 1 and 5),
  scenic smallint check (scenic between 1 and 5),
  surface smallint check (surface between 1 and 5),
  review_text text,
  created_at timestamptz default now(),
  unique (route_id, user_id)
);

alter table public.ratings enable row level security;

create policy "Anyone can view ratings"
  on public.ratings for select using (true);

create policy "Authenticated users can create ratings"
  on public.ratings for insert with check (auth.uid() = user_id);

create policy "Users can update own ratings"
  on public.ratings for update using (auth.uid() = user_id);

-- ============================================================
-- ROUTE PHOTOS
-- ============================================================
create table public.route_photos (
  id uuid default gen_random_uuid() primary key,
  route_id uuid references public.routes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  photo_url text not null,
  created_at timestamptz default now()
);

alter table public.route_photos enable row level security;

create policy "Anyone can view route photos"
  on public.route_photos for select using (true);

create policy "Authenticated users can upload photos"
  on public.route_photos for insert with check (auth.uid() = user_id);

create policy "Users can delete own photos"
  on public.route_photos for delete using (auth.uid() = user_id);

-- ============================================================
-- ACTIVE RIDES — scheduled group rides
-- ============================================================
create table public.active_rides (
  id uuid default gen_random_uuid() primary key,
  route_id uuid references public.routes(id) on delete cascade not null,
  leader_id uuid references public.profiles(id) on delete cascade not null,
  start_time timestamptz not null,
  meeting_point text,
  status text default 'upcoming' check (status in ('upcoming', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

alter table public.active_rides enable row level security;

create policy "Anyone can view active rides"
  on public.active_rides for select using (true);

create policy "Authenticated users can create rides"
  on public.active_rides for insert with check (auth.uid() = leader_id);

create policy "Leaders can update own rides"
  on public.active_rides for update using (auth.uid() = leader_id);

-- ============================================================
-- RIDE PARTICIPANTS — real-time position tracking
-- ============================================================
create table public.ride_participants (
  id uuid default gen_random_uuid() primary key,
  ride_id uuid references public.active_rides(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  current_lat double precision,
  current_lng double precision,
  last_updated timestamptz default now(),
  unique (ride_id, user_id)
);

alter table public.ride_participants enable row level security;

create policy "Ride participants can view co-riders"
  on public.ride_participants for select using (true);

create policy "Users can join rides"
  on public.ride_participants for insert with check (auth.uid() = user_id);

create policy "Users can update own position"
  on public.ride_participants for update using (auth.uid() = user_id);

create policy "Users can leave rides"
  on public.ride_participants for delete using (auth.uid() = user_id);

-- ============================================================
-- RIDE HISTORY — completed rides
-- ============================================================
create table public.ride_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  route_id uuid references public.routes(id) on delete set null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  distance real,
  pace real,
  elevation real,
  calories real,
  created_at timestamptz default now()
);

alter table public.ride_history enable row level security;

create policy "Users can view own ride history"
  on public.ride_history for select using (auth.uid() = user_id);

create policy "Users can create own ride history"
  on public.ride_history for insert with check (auth.uid() = user_id);

create policy "Users can update own ride history"
  on public.ride_history for update using (auth.uid() = user_id);

-- ============================================================
-- REFLECTIONS — "what I learned today"
-- ============================================================
create table public.reflections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  ride_id uuid references public.ride_history(id) on delete cascade,
  text text not null,
  created_at timestamptz default now()
);

alter table public.reflections enable row level security;

create policy "Users can view own reflections"
  on public.reflections for select using (auth.uid() = user_id);

create policy "Users can create reflections"
  on public.reflections for insert with check (auth.uid() = user_id);

create policy "Users can update own reflections"
  on public.reflections for update using (auth.uid() = user_id);

-- ============================================================
-- SAVED ROUTES — bookmarks
-- ============================================================
create table public.saved_routes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  route_id uuid references public.routes(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique (user_id, route_id)
);

alter table public.saved_routes enable row level security;

create policy "Users can view own saved routes"
  on public.saved_routes for select using (auth.uid() = user_id);

create policy "Users can save routes"
  on public.saved_routes for insert with check (auth.uid() = user_id);

create policy "Users can unsave routes"
  on public.saved_routes for delete using (auth.uid() = user_id);

-- ============================================================
-- COMPUTED AVERAGE RATINGS — database function
-- ============================================================
create or replace function public.get_route_avg_rating(rid uuid)
returns table (
  avg_safety numeric,
  avg_lighting numeric,
  avg_beginner numeric,
  avg_scenic numeric,
  avg_surface numeric,
  avg_overall numeric,
  review_count bigint
) as $$
begin
  return query
  select
    round(avg(safety)::numeric, 1),
    round(avg(lighting)::numeric, 1),
    round(avg(beginner)::numeric, 1),
    round(avg(scenic)::numeric, 1),
    round(avg(surface)::numeric, 1),
    round(((avg(safety) + avg(lighting) + avg(beginner) + avg(scenic) + avg(surface)) / 5.0)::numeric, 1),
    count(*)
  from public.ratings
  where route_id = rid;
end;
$$ language plpgsql stable;

-- View: routes with average ratings
create or replace view public.routes_with_ratings as
select
  r.*,
  coalesce(round(((avg(rt.safety) + avg(rt.lighting) + avg(rt.beginner) + avg(rt.scenic) + avg(rt.surface)) / 5.0)::numeric, 1), 0) as avg_rating,
  count(rt.id) as review_count
from public.routes r
left join public.ratings rt on rt.route_id = r.id
group by r.id;

-- ============================================================
-- REALTIME — enable for live tracking tables
-- ============================================================
alter publication supabase_realtime add table public.ride_participants;
alter publication supabase_realtime add table public.active_rides;
