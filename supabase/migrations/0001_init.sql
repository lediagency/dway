-- DWAY · schéma initial (V1)
-- Compte chauffeur, véhicules, clients, revenus, dépenses.
-- Toutes les tables sont protégées par RLS : chaque chauffeur ne voit que ses données.

-- ─────────────────────────────────────────────────────────────
-- Profils
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  company_name text,
  vat_number text,
  phone text,
  -- Objectif de CA brut sur 4 semaines (28 jours glissants)
  goal_4w numeric(10, 2) not null default 5500,
  -- Part employeur par défaut sur les revenus nets (0 = indépendant)
  default_employer_share numeric(5, 2) not null default 0
    check (default_employer_share between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Véhicules
-- ─────────────────────────────────────────────────────────────
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  plate text,
  energy text check (energy in ('essence', 'diesel', 'hybride', 'electrique')),
  ownership text check (ownership in ('propriete', 'leasing', 'location', 'employeur')),
  monthly_cost numeric(10, 2),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index vehicles_user_idx on public.vehicles (user_id);

-- ─────────────────────────────────────────────────────────────
-- Clients (CRM)
-- ─────────────────────────────────────────────────────────────
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  company text,
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now()
);
create index clients_user_idx on public.clients (user_id);

-- ─────────────────────────────────────────────────────────────
-- Revenus
-- Une ligne = une course privée OU un relevé plateforme (ex. relevé Uber de la semaine).
-- ─────────────────────────────────────────────────────────────
create table public.revenues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null default current_date,
  source text not null check (source in (
    'uber', 'bolt', 'heetch', 'blacklane', 'sixt_ride', 'taxi_vert', 'prive', 'autre'
  )),
  label text,
  rides_count integer not null default 1 check (rides_count >= 0),
  gross_amount numeric(10, 2) not null check (gross_amount >= 0),
  platform_fees numeric(10, 2) not null default 0 check (platform_fees >= 0),
  tips numeric(10, 2) not null default 0 check (tips >= 0),
  payment_method text not null default 'app'
    check (payment_method in ('app', 'cash', 'carte', 'virement')),
  -- % du net (hors pourboires) qui revient à l'employeur
  employer_share_pct numeric(5, 2) not null default 0
    check (employer_share_pct between 0 and 100),
  vehicle_id uuid references public.vehicles (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);
create index revenues_user_date_idx on public.revenues (user_id, date desc);

-- ─────────────────────────────────────────────────────────────
-- Dépenses
-- ─────────────────────────────────────────────────────────────
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null default current_date,
  category text not null check (category in (
    'carburant', 'recharge', 'peage_parking', 'lavage', 'entretien', 'assurance',
    'leasing', 'telephone', 'abonnement', 'amende', 'repas', 'autre'
  )),
  label text,
  amount numeric(10, 2) not null check (amount >= 0),
  -- % de la dépense pris en charge par l'employeur (ex. carburant 50, frais avancé 100)
  employer_share_pct numeric(5, 2) not null default 0
    check (employer_share_pct between 0 and 100),
  -- La part employeur a-t-elle déjà été remboursée ?
  reimbursed boolean not null default false,
  vehicle_id uuid references public.vehicles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);
create index expenses_user_date_idx on public.expenses (user_id, date desc);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.clients enable row level security;
alter table public.revenues enable row level security;
alter table public.expenses enable row level security;

create policy "profil : lecture" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profil : mise à jour" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

do $$
declare t text;
begin
  foreach t in array array['vehicles', 'clients', 'revenues', 'expenses'] loop
    execute format(
      'create policy "propriétaire uniquement" on public.%I for all to authenticated
         using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;
