-- =============================================================
-- SPECTRA — Migración 0008: RLS por empresa (cierre de seguridad)
-- Requiere: is_superadmin() y current_empresa_id() (migración 0003)
-- Ejecutar en: Supabase Dashboard > SQL Editor
--
-- Reemplaza las políticas permisivas ("acceso completo autenticados")
-- creadas en 0001_init.sql por políticas que aíslan los datos de
-- cada empresa. El superadmin conserva acceso total.
--
-- Las RPCs crear_orden_con_accesorios y confirmar_salida_orden
-- son security definer y siguen funcionando sin cambios: corren
-- con privilegios del owner y no están sujetas a RLS.
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. CLIENTES
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Acceso completo autenticados — clientes" on public.clientes;

create policy "clientes_select"
  on public.clientes for select
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "clientes_insert"
  on public.clientes for insert
  to authenticated
  with check (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "clientes_update"
  on public.clientes for update
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  )
  with check (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "clientes_delete"
  on public.clientes for delete
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

-- ─────────────────────────────────────────────────────────────
-- 2. ORDENES
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Acceso completo autenticados — ordenes" on public.ordenes;

create policy "ordenes_select"
  on public.ordenes for select
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "ordenes_insert"
  on public.ordenes for insert
  to authenticated
  with check (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "ordenes_update"
  on public.ordenes for update
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  )
  with check (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "ordenes_delete"
  on public.ordenes for delete
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

-- ─────────────────────────────────────────────────────────────
-- 3. TECNICOS
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Acceso completo autenticados — tecnicos" on public.tecnicos;

create policy "tecnicos_select"
  on public.tecnicos for select
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "tecnicos_insert"
  on public.tecnicos for insert
  to authenticated
  with check (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "tecnicos_update"
  on public.tecnicos for update
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  )
  with check (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "tecnicos_delete"
  on public.tecnicos for delete
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

-- ─────────────────────────────────────────────────────────────
-- 4. CONFIG
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Acceso completo autenticados — config" on public.config;

create policy "config_select"
  on public.config for select
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "config_insert"
  on public.config for insert
  to authenticated
  with check (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "config_update"
  on public.config for update
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  )
  with check (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

create policy "config_delete"
  on public.config for delete
  to authenticated
  using (
    is_superadmin()
    or empresa_id = current_empresa_id()
  );

-- ─────────────────────────────────────────────────────────────
-- 5. ACCESORIOS_ORDEN
--
-- No tiene empresa_id propio: la empresa se verifica buscando
-- la orden padre. El OR is_superadmin() cortocircuita el EXISTS
-- para superadmin (PostgreSQL evalúa OR con short-circuit).
-- El índice PRIMARY KEY de ordenes.id hace que el EXISTS sea O(1).
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Acceso completo autenticados — accesorios_orden" on public.accesorios_orden;

create policy "accesorios_orden_select"
  on public.accesorios_orden for select
  to authenticated
  using (
    is_superadmin()
    or exists (
      select 1 from public.ordenes
       where ordenes.id         = accesorios_orden.orden_id
         and ordenes.empresa_id = current_empresa_id()
    )
  );

create policy "accesorios_orden_insert"
  on public.accesorios_orden for insert
  to authenticated
  with check (
    is_superadmin()
    or exists (
      select 1 from public.ordenes
       where ordenes.id         = accesorios_orden.orden_id
         and ordenes.empresa_id = current_empresa_id()
    )
  );

create policy "accesorios_orden_update"
  on public.accesorios_orden for update
  to authenticated
  using (
    is_superadmin()
    or exists (
      select 1 from public.ordenes
       where ordenes.id         = accesorios_orden.orden_id
         and ordenes.empresa_id = current_empresa_id()
    )
  )
  with check (
    is_superadmin()
    or exists (
      select 1 from public.ordenes
       where ordenes.id         = accesorios_orden.orden_id
         and ordenes.empresa_id = current_empresa_id()
    )
  );

create policy "accesorios_orden_delete"
  on public.accesorios_orden for delete
  to authenticated
  using (
    is_superadmin()
    or exists (
      select 1 from public.ordenes
       where ordenes.id         = accesorios_orden.orden_id
         and ordenes.empresa_id = current_empresa_id()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 6. ITEMS_TRABAJO
--
-- Mismo patrón que accesorios_orden.
-- La RPC confirmar_salida_orden (security definer) hace DELETE +
-- INSERT sobre esta tabla sin pasar por estas políticas.
-- ─────────────────────────────────────────────────────────────
drop policy if exists "Acceso completo autenticados — items_trabajo" on public.items_trabajo;

create policy "items_trabajo_select"
  on public.items_trabajo for select
  to authenticated
  using (
    is_superadmin()
    or exists (
      select 1 from public.ordenes
       where ordenes.id         = items_trabajo.orden_id
         and ordenes.empresa_id = current_empresa_id()
    )
  );

create policy "items_trabajo_insert"
  on public.items_trabajo for insert
  to authenticated
  with check (
    is_superadmin()
    or exists (
      select 1 from public.ordenes
       where ordenes.id         = items_trabajo.orden_id
         and ordenes.empresa_id = current_empresa_id()
    )
  );

create policy "items_trabajo_update"
  on public.items_trabajo for update
  to authenticated
  using (
    is_superadmin()
    or exists (
      select 1 from public.ordenes
       where ordenes.id         = items_trabajo.orden_id
         and ordenes.empresa_id = current_empresa_id()
    )
  )
  with check (
    is_superadmin()
    or exists (
      select 1 from public.ordenes
       where ordenes.id         = items_trabajo.orden_id
         and ordenes.empresa_id = current_empresa_id()
    )
  );

create policy "items_trabajo_delete"
  on public.items_trabajo for delete
  to authenticated
  using (
    is_superadmin()
    or exists (
      select 1 from public.ordenes
       where ordenes.id         = items_trabajo.orden_id
         and ordenes.empresa_id = current_empresa_id()
    )
  );
