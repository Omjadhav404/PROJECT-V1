-- =========================================================================
-- NetPulse AI: ISP & Wi-Fi Downtime Tracker & Network Advisory Assistant
-- Migration: 20260929_initial_schema.sql
-- PostgreSQL Database Schema & Row Level Security (RLS) Policies
-- =========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Define Enums
do $$ begin
    create type connection_type_enum as enum ('fiber', 'cable', 'dsl', 'satellite', '5g_home');
exception
    when duplicate_object then null;
end $$;

do $$ begin
    create type incident_status_enum as enum ('active', 'resolved', 'investigating');
exception
    when duplicate_object then null;
end $$;

-- 1. Profiles Table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text not null,
    full_name text,
    default_isp text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Network Incidents Table
create table if not exists public.network_incidents (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    isp_name text not null,
    router_model text,
    connection_type connection_type_enum default 'fiber',
    symptom text not null,
    download_speed numeric,
    upload_speed numeric,
    ping_ms integer,
    status incident_status_enum default 'active',
    ai_diagnosis jsonb,
    started_at timestamp with time zone not null,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Router Configs Table
create table if not exists public.router_configs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    device_name text not null,
    ip_address text,
    ssid text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =========================================================================
-- Performance Indexes
-- =========================================================================
create index if not exists idx_network_incidents_user_id on public.network_incidents(user_id);
create index if not exists idx_network_incidents_status on public.network_incidents(status);
create index if not exists idx_network_incidents_started_at on public.network_incidents(started_at desc);
create index if not exists idx_router_configs_user_id on public.router_configs(user_id);

-- =========================================================================
-- Row Level Security (RLS) Activation
-- =========================================================================
alter table public.profiles enable row level security;
alter table public.network_incidents enable row level security;
alter table public.router_configs enable row level security;

-- Profiles Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" 
    on public.profiles for select 
    using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" 
    on public.profiles for update 
    using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" 
    on public.profiles for insert 
    with check (auth.uid() = id);

-- Network Incidents Policies
drop policy if exists "Users can CRUD own incidents" on public.network_incidents;
create policy "Users can CRUD own incidents" 
    on public.network_incidents for all 
    using (auth.uid() = user_id);

-- Router Configs Policies
drop policy if exists "Users can CRUD own routers" on public.router_configs;
create policy "Users can CRUD own routers" 
    on public.router_configs for all 
    using (auth.uid() = user_id);

-- Trigger to automatically create a profile row upon new Supabase auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, default_isp)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'default_isp');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
