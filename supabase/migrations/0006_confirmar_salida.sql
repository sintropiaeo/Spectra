-- =============================================================
-- SPECTRA — Migración 0006: RPC confirmar salida de orden
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================================

create or replace function public.confirmar_salida_orden(
  p_orden_id    uuid,
  p_tecnico     text,
  p_fecha_salida date,
  p_items       jsonb   -- [{cantidad, detalle, precio_usd, importe}, ...]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Eliminar items anteriores (permite confirmar más de una vez sin duplicar)
  delete from public.items_trabajo
  where orden_id = p_orden_id;

  -- Insertar los nuevos items (solo los que tienen detalle)
  insert into public.items_trabajo (orden_id, cantidad, detalle, precio_usd, importe)
  select
    p_orden_id,
    coalesce((item->>'cantidad')::numeric, 1),
    item->>'detalle',
    nullif(trim(item->>'precio_usd'), '')::numeric,
    nullif(trim(item->>'importe'),    '')::numeric
  from jsonb_array_elements(p_items) as item
  where trim(item->>'detalle') <> '';

  -- Actualizar estado de la orden
  update public.ordenes
  set
    estado       = 'entregado',
    fecha_salida = p_fecha_salida,
    tecnico      = nullif(trim(p_tecnico), '')
  where id = p_orden_id;
end;
$$;

grant execute on function public.confirmar_salida_orden to authenticated;
