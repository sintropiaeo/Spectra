-- =============================================================
-- SPECTRA — Migración 0014: corregir estado de órdenes ya entregadas
--
-- La migración de datos históricos dejó órdenes con fecha_salida cargada
-- pero estado='ingresado' (cuando la planilla SALIDA no traía ENTREGO no
-- se actualizaba el estado). Si una orden tiene fecha de salida, ya fue
-- entregada. Esto las pasa a 'entregado' para que el estado sea coherente
-- (afecta el picker de "Registrar salida" y las listas Pendiente/Entregado).
-- =============================================================

update public.ordenes
set estado = 'entregado'
where estado = 'ingresado'
  and fecha_salida is not null;
