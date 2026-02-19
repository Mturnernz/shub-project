-- ============================================================
-- Sprint 4: Reviews & Ratings + Availability Slots
-- ============================================================

-- Reviews table
create table if not exists reviews (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid references bookings(id) not null,
  reviewer_id   uuid references users(id) not null,
  reviewee_id   uuid references users(id) not null,
  rating        smallint not null check (rating between 1 and 5),
  body          text check (body is null or char_length(body) between 10 and 500),
  worker_response text check (worker_response is null or char_length(worker_response) <= 300),
  created_at    timestamptz default now(),
  is_visible    boolean default true
);

-- One review per booking (unique constraint on booking_id)
create unique index if not exists reviews_booking_id_idx on reviews(booking_id);

-- RLS for reviews
alter table reviews enable row level security;

-- Anyone can read visible reviews
create policy "Visible reviews are public" on reviews
  for select using (is_visible = true);

-- Reviewer can insert their own review
create policy "Reviewer can insert" on reviews
  for insert with check (auth.uid() = reviewer_id);

-- Worker can update only their response field
create policy "Worker can respond" on reviews
  for update using (auth.uid() = reviewee_id)
  with check (auth.uid() = reviewee_id);

-- Admin can update is_visible
create policy "Admin can moderate" on reviews
  for update using (
    exists (
      select 1 from users where id = auth.uid() and role = 'admin'
    )
  );

-- Add avg_rating and review_count to worker_profiles if not present
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'worker_profiles' and column_name = 'avg_rating'
  ) then
    alter table worker_profiles add column avg_rating numeric(3,2) default 0;
    alter table worker_profiles add column review_count integer default 0;
  end if;
end $$;

-- Trigger to update avg_rating and review_count on worker_profiles
create or replace function update_worker_rating()
returns trigger as $$
begin
  update worker_profiles
  set
    avg_rating = (
      select round(avg(rating)::numeric, 2)
      from reviews
      where reviewee_id = NEW.reviewee_id and is_visible = true
    ),
    review_count = (
      select count(*)
      from reviews
      where reviewee_id = NEW.reviewee_id and is_visible = true
    )
  where user_id = NEW.reviewee_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger reviews_update_rating
  after insert or update on reviews
  for each row execute function update_worker_rating();

-- ============================================================
-- Availability slots table
-- ============================================================

create table if not exists availability_slots (
  id           uuid primary key default gen_random_uuid(),
  worker_id    uuid references users(id) not null,
  start_time   timestamptz not null,
  end_time     timestamptz not null,
  is_available boolean default true,
  recurring    jsonb,
  created_at   timestamptz default now()
);

create index if not exists availability_slots_worker_idx on availability_slots(worker_id);
create index if not exists availability_slots_time_idx on availability_slots(start_time, end_time);

alter table availability_slots enable row level security;

-- Workers manage their own slots
create policy "Worker manages own availability" on availability_slots
  for all using (auth.uid() = worker_id);

-- Clients can read published workers' availability
create policy "Clients can read availability" on availability_slots
  for select using (
    exists (
      select 1 from worker_profiles
      where user_id = availability_slots.worker_id and is_published = true
    )
  );

-- ============================================================
-- Push subscriptions table (Sprint 4.3)
-- ============================================================

create table if not exists push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) not null,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

alter table push_subscriptions enable row level security;

create policy "User manages own push subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id);

-- ============================================================
-- Payment methods + handle on worker_profiles (Sprint 5)
-- ============================================================

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'worker_profiles' and column_name = 'preferred_payment_methods'
  ) then
    alter table worker_profiles add column preferred_payment_methods text[] default '{}';
    alter table worker_profiles add column handle text unique;
    alter table worker_profiles add column subscription_tier text default 'free'
      check (subscription_tier in ('free', 'pro', 'premium'));
    alter table worker_profiles add column subscription_expires_at timestamptz;
  end if;
end $$;

-- ============================================================
-- Profile views table (Sprint 6)
-- ============================================================

create table if not exists profile_views (
  id         uuid primary key default gen_random_uuid(),
  worker_id  uuid references users(id) not null,
  viewer_id  uuid references users(id),
  viewed_at  timestamptz default now(),
  source     text
);

create index if not exists profile_views_worker_idx on profile_views(worker_id);
create index if not exists profile_views_time_idx on profile_views(viewed_at);

alter table profile_views enable row level security;

create policy "Anyone can insert view" on profile_views
  for insert with check (true);

create policy "Worker reads own views" on profile_views
  for select using (auth.uid() = worker_id);
