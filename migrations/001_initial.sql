-- TI Corporation EquipHub · migration 001
-- Execute no SQL Editor do seu projeto Supabase, uma vez.
-- Estrutura de dados fica inacessível às chaves anon; somente backend com service_role.
create extension if not exists pgcrypto;
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  name text not null check(length(btrim(name)) between 1 and 120),
  email text not null unique,
  department text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  brand text not null,
  category text not null check(category in ('Notebooks','Monitores','Tablets','Desktops','Acessórios','Projetores','Outros')),
  serial text not null,
  location text not null,
  status text not null default 'available' check(status in ('available','maintenance')),
  created_at timestamptz not null default now()
);
create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references public.equipment(id),
  person_id uuid not null references public.people(id),
  checkout_at date not null,
  due_at date not null,
  returned_at date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  constraint valid_loan_dates check(due_at >= checkout_at)
);
create unique index if not exists one_open_loan_per_item on public.loans(equipment_id) where returned_at is null;
create index if not exists loans_by_person on public.loans(person_id) where returned_at is null;
create index if not exists loans_by_date on public.loans(due_at) where returned_at is null;
create table if not exists public.loan_events (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id),
  event_type text not null check(event_type in ('checkout','return')),
  occurred_at timestamptz not null default now()
);
-- RLS deny-by-default; o backend acessa exclusivamente via SERVICE ROLE.
alter table public.people enable row level security;
alter table public.equipment enable row level security;
alter table public.loans enable row level security;
alter table public.loan_events enable row level security;

-- Cada checkout é transação atômica: lock da pessoa evita corrida no limite 3.
create or replace function public.checkout_equipment(
  _equipment_id uuid, _person_id uuid, _checkout_at date, _due_at date, _notes text default ''
) returns public.loans
language plpgsql security definer set search_path = '' as $$
declare result public.loans;
begin
  if _due_at < _checkout_at or _checkout_at is null or _due_at is null then
    raise exception 'Datas inválidas';
  end if;
  perform 1 from public.people where id = _person_id for update;
  if not found then raise exception 'Colaborador inexistente'; end if;
  perform 1 from public.equipment where id = _equipment_id and status = 'available' for update;
  if not found then raise exception 'Equipamento inexistente ou em manutenção'; end if;
  if (select count(*) from public.loans where person_id = _person_id and returned_at is null) >= 3 then
    raise exception 'Limite de 3 empréstimos ativos por colaborador';
  end if;
  if exists (select 1 from public.loans where equipment_id = _equipment_id and returned_at is null) then
    raise exception 'Equipamento já emprestado';
  end if;
  insert into public.loans(equipment_id, person_id, checkout_at, due_at, notes)
  values (_equipment_id, _person_id, _checkout_at, _due_at, coalesce(_notes,'')) returning * into result;
  insert into public.loan_events(loan_id,event_type) values (result.id,'checkout');
  return result;
end; $$;

create or replace function public.return_equipment(_loan_id uuid) returns public.loans
language plpgsql security definer set search_path = '' as $$
declare result public.loans;
begin
  select * into result from public.loans where id = _loan_id for update;
  if not found then raise exception 'Empréstimo não encontrado'; end if;
  if result.returned_at is not null then raise exception 'Empréstimo já devolvido'; end if;
  update public.loans set returned_at = current_date where id = _loan_id returning * into result;
  insert into public.loan_events(loan_id,event_type) values (result.id,'return');
  return result;
end; $$;
-- As funções com SECURITY DEFINER não devem ser executáveis pelo público.
revoke all on function public.checkout_equipment(uuid,uuid,date,date,text) from public, anon, authenticated;
revoke all on function public.return_equipment(uuid) from public, anon, authenticated;
grant execute on function public.checkout_equipment(uuid,uuid,date,date,text) to service_role;
grant execute on function public.return_equipment(uuid) to service_role;
