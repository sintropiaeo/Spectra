-- =============================================================
-- SPECTRA — Migración 0007: opciones de moneda e IVA en órdenes
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================================

-- -------------------------------------------------------------
-- 1. Nuevas columnas en ordenes
-- -------------------------------------------------------------
alter table public.ordenes
  add column if not exists moneda              text    not null default 'USD',
  add column if not exists aplica_iva          boolean not null default false,
  add column if not exists mostrar_cotizacion  boolean not null default true,
  add column if not exists cotizacion          numeric;

-- -------------------------------------------------------------
-- 2. Renombrar items_trabajo.precio_usd → precio
--    (el precio ahora puede ser USD o ARS según la moneda de la orden)
-- -------------------------------------------------------------
alter table public.items_trabajo
  rename column precio_usd to precio;

-- -------------------------------------------------------------
-- 3. Actualizar la RPC confirmar_salida_orden para que lea la
--    key "precio" del jsonb (antes era "precio_usd")
-- -------------------------------------------------------------
create or replace function public.confirmar_salida_orden(
  p_orden_id     uuid,
  p_tecnico      text,
  p_fecha_salida date,
  p_items        jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.items_trabajo
  where orden_id = p_orden_id;

  insert into public.items_trabajo (orden_id, cantidad, detalle, precio, importe)
  select
    p_orden_id,
    coalesce((item->>'cantidad')::numeric, 1),
    item->>'detalle',
    nullif(trim(item->>'precio'), '')::numeric,
    nullif(trim(item->>'importe'), '')::numeric
  from jsonb_array_elements(p_items) as item
  where trim(item->>'detalle') <> '';

  update public.ordenes
  set
    estado       = 'entregado',
    fecha_salida = p_fecha_salida,
    tecnico      = nullif(trim(p_tecnico), '')
  where id = p_orden_id;
end;
$$;
