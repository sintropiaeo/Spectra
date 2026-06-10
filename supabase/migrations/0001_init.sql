-- =============================================================
-- SPECTRA — Migración inicial
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================================

-- -------------------------------------------------------------
-- 1. CLIENTES
-- -------------------------------------------------------------
create table public.clientes (
  id              uuid primary key default gen_random_uuid(),
  empresa_id      uuid not null,
  razon_social    text not null,
  direccion       text,
  provincia       text,
  localidad       text,
  codigo_postal   text,
  telefono1       text,
  telefono2       text,
  telefono3       text,
  contacto        text,
  created_at      timestamptz not null default now()
);

create index idx_clientes_razon_social on public.clientes (razon_social);
create index idx_clientes_empresa_id   on public.clientes (empresa_id);

-- -------------------------------------------------------------
-- 2. ORDENES
-- -------------------------------------------------------------
create table public.ordenes (
  id              uuid primary key default gen_random_uuid(),
  empresa_id      uuid not null,
  numero          integer not null,
  cliente_id      uuid not null references public.clientes (id) on delete restrict,
  marca           text,
  modelo          text,
  numero_serie    text,
  estacion        text,                      -- handy / base / movil / otro
  deficiencia     text,
  observaciones   text,
  entrego         text,
  quien_recibio   text,
  tecnico         text,
  fecha_ingreso   date not null default current_date,
  fecha_salida    date,
  estado          text not null default 'ingresado',  -- ingresado / entregado
  created_at      timestamptz not null default now(),

  constraint ordenes_numero_empresa_unique unique (empresa_id, numero)
);

create index idx_ordenes_numero       on public.ordenes (numero);
create index idx_ordenes_cliente_id   on public.ordenes (cliente_id);
create index idx_ordenes_numero_serie on public.ordenes (numero_serie);
create index idx_ordenes_estado       on public.ordenes (estado);
create index idx_ordenes_empresa_id   on public.ordenes (empresa_id);

-- -------------------------------------------------------------
-- 3. ACCESORIOS_ORDEN
-- -------------------------------------------------------------
create table public.accesorios_orden (
  orden_id   uuid not null references public.ordenes (id) on delete cascade,
  microfono  boolean not null default false,
  fuente     boolean not null default false,
  cable      boolean not null default false,
  pack       boolean not null default false,
  antena     boolean not null default false,
  cargador   boolean not null default false,
  crem       boolean not null default false,
  created_at timestamptz not null default now(),

  primary key (orden_id)  -- 1 fila por orden
);

-- -------------------------------------------------------------
-- 4. ITEMS_TRABAJO
-- -------------------------------------------------------------
create table public.items_trabajo (
  id          uuid primary key default gen_random_uuid(),
  orden_id    uuid not null references public.ordenes (id) on delete cascade,
  cantidad    numeric not null default 1,
  detalle     text,
  precio_usd  numeric,
  importe     numeric,       -- cantidad * precio_usd (puede calcularse en app o con trigger)
  created_at  timestamptz not null default now()
);

create index idx_items_trabajo_orden_id on public.items_trabajo (orden_id);

-- -------------------------------------------------------------
-- 5. TECNICOS
-- -------------------------------------------------------------
create table public.tecnicos (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null,
  nombre      text not null,
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index idx_tecnicos_empresa_id on public.tecnicos (empresa_id);

-- -------------------------------------------------------------
-- 6. CONFIG
-- -------------------------------------------------------------
create table public.config (
  empresa_id        uuid primary key,
  nombre_empresa    text,
  direccion         text,
  cuit              text,
  cotizacion_dolar  numeric,
  iva               numeric,
  created_at        timestamptz not null default now()
);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================
-- NOTA: las políticas actuales permiten acceso completo a
-- cualquier usuario autenticado. Cuando conectemos el login
-- multi-empresa habrá que reemplazarlas por políticas que
-- filtren por empresa_id usando el claim del JWT, por ejemplo:
--   using ( empresa_id = (auth.jwt() ->> 'empresa_id')::uuid )
-- =============================================================

alter table public.clientes        enable row level security;
alter table public.ordenes         enable row level security;
alter table public.accesorios_orden enable row level security;
alter table public.items_trabajo   enable row level security;
alter table public.tecnicos        enable row level security;
alter table public.config          enable row level security;

-- clientes
create policy "Acceso completo autenticados — clientes"
  on public.clientes for all
  to authenticated
  using (true)
  with check (true);

-- ordenes
create policy "Acceso completo autenticados — ordenes"
  on public.ordenes for all
  to authenticated
  using (true)
  with check (true);

-- accesorios_orden
create policy "Acceso completo autenticados — accesorios_orden"
  on public.accesorios_orden for all
  to authenticated
  using (true)
  with check (true);

-- items_trabajo
create policy "Acceso completo autenticados — items_trabajo"
  on public.items_trabajo for all
  to authenticated
  using (true)
  with check (true);

-- tecnicos
create policy "Acceso completo autenticados — tecnicos"
  on public.tecnicos for all
  to authenticated
  using (true)
  with check (true);

-- config
create policy "Acceso completo autenticados — config"
  on public.config for all
  to authenticated
  using (true)
  with check (true);
