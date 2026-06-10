-- =============================================================
-- SPECTRA — Migración 0004: borrado lógico en clientes
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================================

alter table public.clientes
  add column if not exists activo boolean not null default true;

-- Índice para que las queries con where activo = true sean rápidas
create index if not exists idx_clientes_activo on public.clientes (activo);
