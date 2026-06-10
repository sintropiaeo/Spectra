-- =============================================================
-- SPECTRA — Migración 0002: autenticación multi-empresa
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================================

-- -------------------------------------------------------------
-- 1. EMPRESAS
-- -------------------------------------------------------------
create table public.empresas (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  created_at timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 2. PERFILES
-- vincula cada usuario de Supabase Auth con su empresa y rol
-- -------------------------------------------------------------
create table public.perfiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  empresa_id uuid references public.empresas (id) on delete set null,
  nombre     text,
  rol        text not null default 'tecnico',  -- admin / tecnico / lectura
  created_at timestamptz not null default now()
);

create index idx_perfiles_empresa_id on public.perfiles (empresa_id);

-- -------------------------------------------------------------
-- 3. TRIGGER: crear fila en perfiles al registrar un usuario
-- empresa_id y rol se asignan manualmente para el primer admin
-- -------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

alter table public.empresas enable row level security;
alter table public.perfiles  enable row level security;

-- perfiles: cada usuario lee y edita solo su propia fila
create policy "Ver propio perfil"
  on public.perfiles for select
  to authenticated
  using ( id = auth.uid() );

create policy "Actualizar propio perfil"
  on public.perfiles for update
  to authenticated
  using ( id = auth.uid() )
  with check ( id = auth.uid() );

-- empresas: un usuario puede leer la empresa a la que pertenece
create policy "Ver propia empresa"
  on public.empresas for select
  to authenticated
  using (
    id = (
      select empresa_id
      from public.perfiles
      where perfiles.id = auth.uid()
      limit 1
    )
  );
