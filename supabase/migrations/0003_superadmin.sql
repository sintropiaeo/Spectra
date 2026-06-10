-- =============================================================
-- SPECTRA — Migración 0003: rol superadmin
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- =============================================================

-- -------------------------------------------------------------
-- 1. FUNCIONES HELPER (security definer)
--
-- Usar security definer es obligatorio aquí: las políticas RLS
-- sobre perfiles necesitan consultar perfiles para resolver el
-- usuario actual, lo que produciría recursión infinita si la
-- consulta interna también activara RLS. Con security definer
-- las funciones corren con privilegios del owner (postgres) y
-- se saltean RLS, rompiendo el ciclo.
-- -------------------------------------------------------------

create or replace function public.is_superadmin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.perfiles
    where id = auth.uid()
      and rol = 'superadmin'
  );
$$;

create or replace function public.current_empresa_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select empresa_id
  from public.perfiles
  where id = auth.uid()
  limit 1;
$$;

-- Permitir que usuarios autenticados invoquen estas funciones
grant execute on function public.is_superadmin()      to authenticated;
grant execute on function public.current_empresa_id() to authenticated;

-- -------------------------------------------------------------
-- 2. POLÍTICAS DE PERFILES (reemplaza las de 0002)
-- -------------------------------------------------------------
drop policy if exists "Ver propio perfil"       on public.perfiles;
drop policy if exists "Actualizar propio perfil" on public.perfiles;

-- SELECT
-- • Usuario normal: ve solo los perfiles de su empresa, sin filas superadmin
-- • Superadmin: ve todos los perfiles
create policy "Ver perfiles"
  on public.perfiles for select
  to authenticated
  using (
    is_superadmin()
    or (
      empresa_id = current_empresa_id()
      and rol <> 'superadmin'
    )
  );

-- UPDATE
-- using  → qué filas puede intentar actualizar
-- with check → cómo tiene que quedar la fila tras la actualización
--
-- • Usuario normal: solo puede editar su propia fila y el resultado
--   no puede tener rol = 'superadmin' (bloquea escalada de privilegios)
-- • Superadmin: puede actualizar cualquier fila sin restricción de rol
create policy "Actualizar perfiles"
  on public.perfiles for update
  to authenticated
  using (
    is_superadmin()
    or id = auth.uid()
  )
  with check (
    is_superadmin()
    or (
      id = auth.uid()
      and rol <> 'superadmin'
    )
  );

-- -------------------------------------------------------------
-- 3. POLÍTICAS DE EMPRESAS (reemplaza la de 0002)
-- -------------------------------------------------------------
drop policy if exists "Ver propia empresa" on public.empresas;

-- SELECT
-- • Usuario normal: ve solo la empresa a la que pertenece
-- • Superadmin: ve todas las empresas
create policy "Ver empresas"
  on public.empresas for select
  to authenticated
  using (
    is_superadmin()
    or id = current_empresa_id()
  );
