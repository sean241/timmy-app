-- ==============================================================================
-- SCRIPT COMPLET SAAS RH (Multi-Tenant & Sécurisé)
-- Date : 11 Dec 2025
-- ==============================================================================

-- 1. CONFIGURATION INITIALE & EXTENSIONS
-- ==========================================
create extension if not exists "uuid-ossp";

-- Nettoyage (si besoin de repartir de zéro lors des tests, décommentez les lignes drop)
-- drop type if exists user_role, sub_plan, shift_status, log_type, kiosk_status, payroll_status cascade;

-- Types ENUM (Les listes de choix)
create type user_role as enum ('OWNER', 'MANAGER', 'ACCOUNTANT', 'EMPLOYEE_RO'); 
create type sub_plan as enum ('TRIAL', 'PRO', 'ENTERPRISE');
create type shift_status as enum ('DRAFT', 'PUBLISHED');
create type log_type as enum ('CHECK_IN', 'CHECK_OUT', 'BREAK_START', 'BREAK_END');
create type kiosk_status as enum ('ONLINE', 'OFFLINE', 'REVOKED', 'PENDING');
create type payroll_status as enum ('DRAFT', 'LOCKED', 'PAID');

-- ==========================================
-- 2. STRUCTURE SAAS (ENTREPRISES & UTILISATEURS)
-- ==========================================

-- Table des Entreprises (Clients)
create table public.organizations (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique, 
  
  -- Info Facturation (B2B Afrique)
  nif_number text, 
  rccm_number text,
  billing_address text,
  billing_email text,
  country text default 'Gabon',
  
  -- Configuration & Abonnements
  plan sub_plan default 'TRIAL',
  subscription_status text default 'ACTIVE',
  trial_ends_at timestamp with time zone default (now() + interval '14 days'),
  
  -- Paramètres Globaux (Tolérance retard, devise, etc.)
  settings jsonb default '{"currency": "XAF", "timezone": "Africa/Libreville", "late_tolerance": 15, "require_photo": true}'::jsonb,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Table de liaison Utilisateurs Dashboard (Managers, RH, Patrons)
-- Cette table étend la table de base "auth.users" de Supabase
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  organization_id uuid references public.organizations(id),
  
  email text,
  first_name text,
  last_name text,
  phone text,
  role user_role default 'EMPLOYEE_RO', -- Sécurité : rôle faible par défaut
  avatar_url text,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==========================================
-- 3. RESSOURCES (RH & LIEUX)
-- ==========================================

-- Table des Chantiers / Lieux de travail
create table public.sites (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  
  name text not null,
  city text default 'Libreville',
  address text,
  gps_lat double precision,
  gps_lng double precision,
  radius_meters int default 200, -- Rayon autorisé pour pointer
  
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Table des Employés (Ceux qui pointent sur le terrain)
-- Note : distincte des utilisateurs du dashboard pour simplifier la licence
create table public.employees (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  site_id uuid references public.sites(id),
  
  first_name text not null,
  last_name text not null,
  avatar_url text,
  
  -- Infos Métier
  job_title text,
  hourly_rate numeric(10, 2) default 0, -- Taux horaire actuel
  
  -- Infos Connexion Kiosque
  pin_code text not null, -- Code PIN pour pointer
  whatsapp_number text,
  email text,
  
  -- Statut
  is_active boolean default true,
  archived_at timestamp with time zone,
  
  created_at timestamp with time zone default now(),
  
  -- WhatsApp Verification
  is_whatsapp_verified boolean default false,
  whatsapp_verified_at timestamp with time zone,
  
  -- Phone Number Handling
  phone_code text default '+241',
  full_phone_formatted text generated always as (phone_code || ' ' || whatsapp_number) stored
);

-- ==========================================
-- 4. MATÉRIEL (KIOSQUES / POINTEUSES)
-- ==========================================

create table public.kiosks (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  site_id uuid references public.sites(id),
  
  name text not null,
  device_id text, -- ID unique de la tablette
  pairing_code text,
  
  require_photo boolean default true,
  require_badge_scan boolean default false,
  require_signature boolean default false,
  status kiosk_status default 'PENDING',
  last_heartbeat_at timestamp with time zone,
  
  created_at timestamp with time zone default now(),
  
  -- Contrainte d'unicité : Pas de doublon de code d'appairage dans la même entreprise
  unique (organization_id, pairing_code)
);

-- ==========================================
-- 5. OPÉRATIONNEL (PLANNING & LOGS)
-- ==========================================

-- Plannings (Shifts prévus)
create table public.shifts (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  employee_id uuid references public.employees(id) not null,
  site_id uuid references public.sites(id) not null,
  
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  break_minutes int default 60,
  
  status shift_status default 'DRAFT',
  color_code text,
  notes text,
  
  created_at timestamp with time zone default now()
);

-- Pointages réels (Logs)
create table public.attendance_logs (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  employee_id uuid references public.employees(id) not null,
  site_id uuid references public.sites(id),
  kiosk_id uuid references public.kiosks(id),
  
  timestamp timestamp with time zone not null,
  type log_type not null, -- ENTRÉE, SORTIE, PAUSE...
  
  photo_url text,
  gps_lat double precision,
  gps_lng double precision,
  is_offline_sync boolean default false, -- Si synchronisé plus tard (coupure internet)
  is_manual_entry boolean default false, -- Si corrigé par un manager
  correction_reason text,
  
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 6. FINANCE (PAIE)
-- ==========================================

-- Périodes de Paie (ex: "Novembre 2025")
create table public.payroll_periods (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id) not null,
  
  name text not null,
  start_date date not null,
  end_date date not null,
  
  status payroll_status default 'DRAFT',
  locked_at timestamp with time zone,
  
  created_at timestamp with time zone default now()
);

-- Détail Paie par Employé (Fiche de paie simplifiée)
create table public.payroll_entries (
  id uuid default uuid_generate_v4() primary key,
  payroll_period_id uuid references public.payroll_periods(id) on delete cascade not null,
  employee_id uuid references public.employees(id) not null,
  
  total_hours numeric(10, 2) default 0,
  overtime_hours numeric(10, 2) default 0,
  
  hourly_rate_snapshot numeric(10, 2), -- Important: Taux figé au moment de la paie
  total_gross numeric(10, 2), -- Salaire Brut
  
  bonuses jsonb default '{}'::jsonb, -- Primes (Panier, Transport...)
  advance_amount numeric(10, 2) default 0, -- Acomptes déjà versés
  total_net numeric(10, 2), -- Net à payer
  
  is_paid boolean default false,
  payment_method text,
  
  created_at timestamp with time zone default now()
);

-- ==========================================
-- 7. SÉCURITÉ (ROW LEVEL SECURITY - RLS)
-- ==========================================
-- Empêche une entreprise A de voir les données de l'entreprise B

-- Activation de la sécurité sur toutes les tables
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.sites enable row level security;
alter table public.employees enable row level security;
alter table public.kiosks enable row level security;
alter table public.shifts enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.payroll_periods enable row level security;
alter table public.payroll_entries enable row level security;

-- --- POLITIQUES DE SÉCURITÉ ---

-- 1. PROFILES (Utilisateurs)
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 2. ORGANIZATIONS (Entreprises)
-- Lecture : On voit son entreprise
create policy "Users can view own organization" on public.organizations
  for select using (id in (select organization_id from public.profiles where id = auth.uid()));
-- Modification : Seul le OWNER peut modifier les infos de l'entreprise
create policy "Owners can update organization" on public.organizations
  for update using (
    id in (select organization_id from public.profiles where id = auth.uid() and role = 'OWNER')
  );

-- 3. RESSOURCES & OPS (Sites, Employés, Logs...)
-- Règle universelle : "Je peux voir/modifier si ça appartient à mon organisation"
create policy "Access sites from same org" on public.sites
  for all using (organization_id in (select organization_id from public.profiles where id = auth.uid()));

create policy "Access employees from same org" on public.employees
  for all using (organization_id in (select organization_id from public.profiles where id = auth.uid()));

create policy "Access kiosks from same org" on public.kiosks
  for all using (organization_id in (select organization_id from public.profiles where id = auth.uid()));

create policy "Access shifts from same org" on public.shifts
  for all using (organization_id in (select organization_id from public.profiles where id = auth.uid()));

create policy "Access logs from same org" on public.attendance_logs
  for all using (organization_id in (select organization_id from public.profiles where id = auth.uid()));

-- Logs de l'application (Audit / Debug)
-- 1. La table (C'était bon)
create table public.app_logs (
  id uuid default uuid_generate_v4() primary key,
  organization_id uuid references public.organizations(id),
  user_id uuid references public.profiles(id) default auth.uid(), -- Référence PROFILES pour permettre les joins
  
  action text not null, 
  details jsonb default '{}'::jsonb,
  level text default 'INFO',
  
  created_at timestamp with time zone default now()
);

alter table public.app_logs enable row level security;

-- 2. POLITIQUE DE LECTURE (SÉCURISÉE)
-- Seuls les Patrons et Managers peuvent consulter les logs (Audit)
create policy "Admins view org logs" on public.app_logs
  for select using (
    organization_id in (
      select organization_id from public.profiles 
      where id = auth.uid() 
      and role in ('OWNER', 'MANAGER') -- <--- AJOUT DE CETTE SÉCURITÉ
    )
  );

-- 3. POLITIQUE D'ÉCRITURE (SÉCURISÉE)
-- Un utilisateur ne peut créer un log que s'il est signé de son propre ID
create policy "Users insert own logs" on public.app_logs
  for insert with check (
    auth.uid() = user_id -- <--- OBLIGATION DE SIGNER CORRECTEMENT
  );

-- 4. FINANCE (Restriction spéciale)
-- Seuls les OWNER, ACCOUNTANT et MANAGER voient la paie. Les employés simple (EMPLOYEE_RO) ne voient rien.
create policy "Authorized roles can view payroll" on public.payroll_periods
  for select using (
    organization_id in (
      select organization_id from public.profiles 
      where id = auth.uid() 
      and role in ('OWNER', 'ACCOUNTANT', 'MANAGER')
    )
  );

create policy "Owners/Accountants can manage payroll" on public.payroll_periods
  for all using (
    organization_id in (
      select organization_id from public.profiles 
      where id = auth.uid() 
      and role in ('OWNER', 'ACCOUNTANT')
    )
  );

create policy "Authorized roles can view payroll entries" on public.payroll_entries
  for select using (
    payroll_period_id in (
      select id from public.payroll_periods where organization_id in (
        select organization_id from public.profiles where id = auth.uid()
      )
    )
  );

-- ==========================================
-- 8. AUTOMATISATION & ONBOARDING (LOGIQUE MÉTIER)
-- ==========================================

-- A. TRIGGER : GESTION DES NOUVEAUX INSCRITS ET INVITÉS
-- Ce code s'exécute automatiquement à chaque création de compte (Auth)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (
    id, 
    first_name, 
    last_name, 
    email, 
    phone,
    role, 
    organization_id
  )
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    -- Cast safe du rôle
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'EMPLOYEE_RO'::public.user_role),
    -- Gestion safe de l'UUID (null ou vide)
    case 
      when new.raw_user_meta_data->>'organization_id' is null or new.raw_user_meta_data->>'organization_id' = '' then null
      else (new.raw_user_meta_data->>'organization_id')::uuid
    end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==============================================================================
-- B. FONCTION : CRÉATION D'UNE NOUVELLE ENTREPRISE (Mise à jour pour tes écrans)
-- ==============================================================================
-- Cette fonction reçoit toutes les infos de tes écrans (Images 5, 6 et 7)

create or replace function create_organization_for_user(
  org_name text,       -- BTP Gabon
  org_sector text,     -- BTP / Construction
  org_country text,    -- Gabon
  site_name text,      -- Siège Social (Image 6)
  site_address text,   -- Oloumi (Image 6)
  manager_pin text     -- 1111 (Image 7)
)
returns json
language plpgsql
security definer
as $$
declare
  new_org_id uuid;
  new_site_id uuid;
  current_user_id uuid;
  user_email text;
  user_first_name text;
  user_last_name text;
begin
  current_user_id := auth.uid();
  
  -- On récupère les infos de l'utilisateur connecté (Email, Nom, Prénom)
  select email, first_name, last_name 
  into user_email, user_first_name, user_last_name
  from public.profiles 
  where id = current_user_id;

  if current_user_id is null then
    raise exception 'Utilisateur non connecté';
  end if;

  -- 1. CRÉER L'ENTREPRISE (Image 5)
  insert into public.organizations (name, billing_address, settings)
  values (
    org_name, 
    site_address, -- On met l'adresse du siège comme adresse de facturation par défaut
    jsonb_build_object(
      'sector', org_sector,
      'country', org_country,
      'currency', case when org_country = 'Gabon' then 'XAF' else 'EUR' end
    )
  )
  returning id into new_org_id;

  -- 2. METTRE À JOUR LE PROFIL MANAGER (Image 4 - "Je suis Manager")
  update public.profiles
  set 
    organization_id = new_org_id,
    role = 'OWNER'
  where id = current_user_id;

  -- 3. CRÉER LE PREMIER LIEU DE TRAVAIL (Image 6)
  insert into public.sites (organization_id, name, address, is_active)
  values (new_org_id, site_name, site_address, true)
  returning id into new_site_id;

  -- 4. CRÉER LA FICHE EMPLOYÉ DU MANAGER (Image 7 - Pour qu'il puisse pointer)
  -- C'est ici qu'on sauve son PIN "1111"
  insert into public.employees (
    organization_id, 
    site_id, 
    first_name, 
    last_name, 
    email, 
    pin_code, 
    job_title
  )
  values (
    new_org_id,
    new_site_id,
    coalesce(user_first_name, 'Manager'), -- Sécurité si le prénom est vide
    coalesce(user_last_name, 'Principal'),
    user_email,
    manager_pin, -- Le fameux code PIN
    'Gérant / Owner'
  );

  return json_build_object('organization_id', new_org_id);
end;
$$;
