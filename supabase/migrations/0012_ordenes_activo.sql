-- =============================================================
-- SPECTRA — Migración 0012: borrado lógico en ordenes
--
-- Permite "eliminar" una entrada de equipo sin destruir la fila ni
-- cascadear accesorios/ítems de salida, y sin dejar hueco duro en la
-- numeración. Mismo criterio que clientes.activo. Las listas filtran
-- por activo = true; el resto del sistema no cambia.
-- =============================================================

alter table public.ordenes
  add column if not exists activo boolean not null default true;

create index if not exists idx_ordenes_activo on public.ordenes (activo);
