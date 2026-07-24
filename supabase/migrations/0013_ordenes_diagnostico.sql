-- =============================================================
-- SPECTRA — Migración 0013: campo de diagnóstico en la salida
--
-- Texto libre descriptivo del trabajo/diagnóstico, independiente de la
-- tabla items_trabajo (cantidad/detalle/precio). Se completa al registrar
-- o editar la salida de un equipo. Opcional.
-- =============================================================

alter table public.ordenes
  add column if not exists diagnostico text;
