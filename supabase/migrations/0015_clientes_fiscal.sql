-- =============================================================
-- SPECTRA — Migración 0015: datos fiscales en clientes
--
-- Agrega CUIT, e-mail y condición frente al IVA (todos opcionales).
-- No se toca telefono3: sigue existiendo con sus datos, solo se oculta
-- del formulario (cambio de UI, no de schema).
-- =============================================================

alter table public.clientes
  add column if not exists cuit          text,
  add column if not exists email         text,
  add column if not exists condicion_iva text;
