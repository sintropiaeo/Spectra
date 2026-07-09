-- =============================================================
-- SPECTRA — Migración 0010: remitos con múltiples ítems (filas)
--
-- El papel físico tiene una tabla con varias filas (cantidad + detalle).
-- Se reemplaza el par único cantidad/detalle por un arreglo `items`:
--   [{ "cantidad": "2", "detalle": "..." }, ...]
-- Las columnas cantidad/detalle se conservan por compatibilidad pero
-- ya no se usan desde la app.
-- =============================================================

alter table public.remitos_manuales
  add column if not exists items jsonb not null default '[]'::jsonb;

-- Migrar cualquier remito ya cargado (cantidad/detalle → primer ítem)
update public.remitos_manuales
set items = jsonb_build_array(
      jsonb_build_object(
        'cantidad', coalesce(cantidad, ''),
        'detalle',  coalesce(detalle, '')
      )
    )
where items = '[]'::jsonb
  and (cantidad is not null or detalle is not null);
