-- =============================================================
-- SPECTRA — Migración 0011: configuración de impresión de remitos por empresa
--
-- Guarda las coordenadas de calibración (en mm) de cada empresa en jsonb,
-- para que el PDF de remitos se posicione según el papel físico de cada una,
-- sin depender del archivo estático de placeholders.
--
-- Estructura de `coords`:
--   {
--     "campos": {
--       "fecha":        { "x_mm":.., "y_mm":.., "maxWidth_mm":.. },
--       "razonSocial":  { ... }, "domicilio": {...},
--       "condicionIva": { ... }, "cuit": {...}
--     },
--     "tabla": {
--       "y_mm":.., "filaAltura_mm":.., "filasMax":..,
--       "cantidad": { "x_mm":.., "maxWidth_mm":.. },
--       "detalle":  { "x_mm":.., "maxWidth_mm":.. }
--     }
--   }
-- =============================================================

create table public.remito_print_config (
  empresa_id uuid primary key references public.empresas (id) on delete cascade,
  coords     jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

-- set_updated_at() ya existe desde 0009
create trigger trg_remito_print_config_updated_at
  before update on public.remito_print_config
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------------
-- RLS (mismo patrón que el resto del sistema)
-- -------------------------------------------------------------
alter table public.remito_print_config enable row level security;

create policy "remito_print_config_select"
  on public.remito_print_config for select
  to authenticated
  using ( is_superadmin() or empresa_id = current_empresa_id() );

create policy "remito_print_config_insert"
  on public.remito_print_config for insert
  to authenticated
  with check ( is_superadmin() or empresa_id = current_empresa_id() );

create policy "remito_print_config_update"
  on public.remito_print_config for update
  to authenticated
  using ( is_superadmin() or empresa_id = current_empresa_id() )
  with check ( is_superadmin() or empresa_id = current_empresa_id() );

create policy "remito_print_config_delete"
  on public.remito_print_config for delete
  to authenticated
  using ( is_superadmin() or empresa_id = current_empresa_id() );
