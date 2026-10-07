-- DWAY · courses et réservations privées

-- ─────────────────────────────────────────────────────────────
-- Réservations (courses à venir, clients privés)
-- ─────────────────────────────────────────────────────────────
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Numéro lisible par chauffeur : RÉSERVATION #001, #002…
  number integer not null,
  status text not null default 'confirmee'
    check (status in ('a_confirmer', 'confirmee', 'effectuee', 'annulee')),
  client_id uuid references public.clients (id) on delete set null,
  client_name text not null,
  client_phone text,
  date date not null,
  time time not null,
  pickup text not null,
  dropoff text not null,
  passengers integer not null default 1 check (passengers between 1 and 60),
  vehicle text,
  price numeric(10, 2) not null check (price >= 0),
  payment_method text not null default 'cash'
    check (payment_method in ('app', 'cash', 'carte', 'virement')),
  flight_number text,
  employer_share_pct numeric(5, 2) not null default 0
    check (employer_share_pct between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, number)
);
create index bookings_user_date_idx on public.bookings (user_id, date, time);

create function public.set_booking_number()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.number is null then
    -- Verrou par chauffeur pour éviter deux réservations avec le même numéro.
    perform pg_advisory_xact_lock(hashtext(new.user_id::text));
    select coalesce(max(number), 0) + 1 into new.number
    from public.bookings where user_id = new.user_id;
  end if;
  return new;
end;
$$;

create trigger bookings_set_number
  before insert on public.bookings
  for each row execute function public.set_booking_number();

alter table public.bookings enable row level security;
create policy "propriétaire uniquement" on public.bookings for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ─────────────────────────────────────────────────────────────
-- Courses = revenus détaillés (kind = 'course')
-- Une course compte une seule fois dans le CA : c'est une ligne de revenu.
-- ─────────────────────────────────────────────────────────────
alter table public.revenues
  add column kind text not null default 'releve' check (kind in ('releve', 'course')),
  add column start_time time,
  add column pickup text,
  add column dropoff text,
  add column distance_km numeric(8, 1) check (distance_km >= 0),
  add column booking_id uuid unique references public.bookings (id) on delete set null;

create index revenues_user_kind_idx on public.revenues (user_id, kind, date desc);
