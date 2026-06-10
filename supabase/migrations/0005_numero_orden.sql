-- =============================================================
-- SPECTRA — Migración 0005: número correlativo de orden + RPC atómica
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================================

-- -------------------------------------------------------------
-- 1. TRIGGER: número correlativo por empresa
--
-- pg_advisory_xact_lock serializa los inserts de la MISMA
-- empresa dentro de transacciones concurrentes, evitando el
-- race condition que tendría un simple MAX() + 1 sin bloqueo.
-- El lock se libera automáticamente al finalizar la transacción.
-- -------------------------------------------------------------
create or replace function public.set_numero_orden()
returns trigger
language plpgsql
as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.empresa_id::text));

  select coalesce(max(numero), 0) + 1
  into new.numero
  from public.ordenes
  where empresa_id = new.empresa_id;

  return new;
end;
$$;

create trigger trg_set_numero_orden
  before insert on public.ordenes
  for each row execute function public.set_numero_orden();

-- -------------------------------------------------------------
-- 2. RPC: insertar orden + accesorios en una sola transacción
--
-- Si falla cualquiera de los dos inserts, Postgres revierte
-- ambos automáticamente (las funciones PL/pgSQL corren dentro
-- de la transacción del llamador).
-- -------------------------------------------------------------
create or replace function public.crear_orden_con_accesorios(
  p_empresa_id    uuid,
  p_cliente_id    uuid,
  p_marca         text    default null,
  p_modelo        text    default null,
  p_numero_serie  text    default null,
  p_estacion      text    default null,
  p_deficiencia   text    default null,
  p_observaciones text    default null,
  p_entrego       text    default null,
  p_quien_recibio text    default null,
  p_tecnico       text    default null,
  p_fecha_ingreso date    default current_date,
  p_microfono     boolean default false,
  p_fuente        boolean default false,
  p_cable         boolean default false,
  p_pack          boolean default false,
  p_antena        boolean default false,
  p_cargador      boolean default false,
  p_crem          boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_orden_id uuid;
  v_numero   integer;
begin
  insert into public.ordenes (
    empresa_id, cliente_id, marca, modelo, numero_serie,
    estacion, deficiencia, observaciones, entrego,
    quien_recibio, tecnico, fecha_ingreso, estado
  ) values (
    p_empresa_id,
    p_cliente_id,
    nullif(trim(p_marca), ''),
    nullif(trim(p_modelo), ''),
    nullif(trim(p_numero_serie), ''),
    nullif(trim(p_estacion), ''),
    nullif(trim(p_deficiencia), ''),
    nullif(trim(p_observaciones), ''),
    nullif(trim(p_entrego), ''),
    nullif(trim(p_quien_recibio), ''),
    nullif(trim(p_tecnico), ''),
    p_fecha_ingreso,
    'ingresado'
  )
  returning id, numero into v_orden_id, v_numero;

  insert into public.accesorios_orden (
    orden_id, microfono, fuente, cable, pack, antena, cargador, crem
  ) values (
    v_orden_id,
    p_microfono, p_fuente, p_cable, p_pack, p_antena, p_cargador, p_crem
  );

  return jsonb_build_object('orden_id', v_orden_id, 'numero', v_numero);
end;
$$;

-- Permitir que usuarios autenticados invoquen la RPC
grant execute on function public.crear_orden_con_accesorios to authenticated;
