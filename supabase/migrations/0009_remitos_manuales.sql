-- =============================================================
-- SPECTRA — Migración 0009: remitos manuales (impresión sobre papel CAI)
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- Solución transitoria: la empresa usa papel pre-impreso con CAI de
-- AFIP y hoy carga los datos variables en un Excel que se desalinea.
-- Esta tabla guarda esos datos variables para imprimirlos posicionados
-- sobre el papel físico. Todos los campos de identificación del cliente
-- son SNAPSHOTS editables: se autocompletan del cliente pero se pueden
-- modificar sin afectar el registro del cliente.
-- =============================================================

-- -------------------------------------------------------------
-- 1. FUNCIÓN genérica para mantener updated_at
--    (idempotente: create or replace, reutilizable a futuro)
-- -------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -------------------------------------------------------------
-- 2. TABLA remitos_manuales
-- -------------------------------------------------------------
create table public.remitos_manuales (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null,
  cliente_id     uuid references public.clientes (id) on delete set null,  -- nullable: datos sueltos
  razon_social   text,          -- snapshot editable
  domicilio      text,          -- snapshot editable
  condicion_iva  text,          -- snapshot editable
  cuit           text,          -- snapshot editable
  fecha          date not null default current_date,
  numero_fisico  text,          -- número ya impreso en el papel; SOLO búsqueda interna, nunca va al PDF
  cantidad       text,          -- campo libre, no numérico
  detalle        text,          -- texto largo multilínea
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  created_by     uuid references auth.users (id) on delete set null
);

create index idx_remitos_manuales_empresa_id    on public.remitos_manuales (empresa_id);
create index idx_remitos_manuales_cliente_id    on public.remitos_manuales (cliente_id);
create index idx_remitos_manuales_fecha         on public.remitos_manuales (fecha);
create index idx_remitos_manuales_numero_fisico on public.remitos_manuales (numero_fisico);
-- Búsqueda por razón social snapshot (case-insensitive)
create index idx_remitos_manuales_razon_social  on public.remitos_manuales (lower(razon_social));

create trigger trg_remitos_manuales_updated_at
  before update on public.remitos_manuales
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (mismo patrón que 0008)
--    is_superadmin() OR empresa_id = current_empresa_id()
-- -------------------------------------------------------------
alter table public.remitos_manuales enable row level security;

create policy "remitos_manuales_select"
  on public.remitos_manuales for select
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "remitos_manuales_insert"
  on public.remitos_manuales for insert
  to authenticated
  with check (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "remitos_manuales_update"
  on public.remitos_manuales for update
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  )
  with check (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "remitos_manuales_delete"
  on public.remitos_manuales for delete
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );
