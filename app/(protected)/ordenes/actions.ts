"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { OrdenPDFData } from "@/lib/pdf-types";
import { RemitoPDFData } from "@/lib/remito-types";

export async function getOrdenForPDF(ordenId: string): Promise<OrdenPDFData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ordenes")
    .select(`
      id, numero, fecha_ingreso, marca, modelo, numero_serie,
      estacion, deficiencia, observaciones, entrego, quien_recibio, tecnico,
      empresa_id,
      clientes:cliente_id (
        razon_social, direccion, localidad, provincia, codigo_postal, telefono1, contacto
      ),
      accesorios_orden (
        microfono, fuente, cable, pack, antena, cargador, crem
      )
    `)
    .eq("id", ordenId)
    .single();

  if (error || !data) return null;

  const { data: config } = await supabase
    .from("config")
    .select("nombre_empresa, direccion, cuit")
    .eq("empresa_id", data.empresa_id)
    .single();

  return {
    orden: {
      id: data.id,
      numero: data.numero,
      fecha_ingreso: data.fecha_ingreso,
      marca: data.marca,
      modelo: data.modelo,
      numero_serie: data.numero_serie,
      estacion: data.estacion,
      deficiencia: data.deficiencia,
      observaciones: data.observaciones,
      entrego: data.entrego,
      quien_recibio: data.quien_recibio,
      tecnico: data.tecnico,
    },
    cliente: data.clientes as OrdenPDFData["cliente"],
    accesorios: data.accesorios_orden as OrdenPDFData["accesorios"],
    config: config ?? null,
  };
}

export async function getOrden(ordenId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ordenes")
    .select(`
      id, numero, fecha_ingreso, estado, marca, modelo, numero_serie,
      estacion, deficiencia, observaciones, entrego, quien_recibio, tecnico,
      empresa_id,
      clientes:cliente_id ( razon_social, telefono1, localidad )
    `)
    .eq("id", ordenId)
    .single();
  return data;
}

// ─── Datos para el remito de salida (PDF) ────────────────────
export async function getOrdenParaRemito(ordenId: string): Promise<RemitoPDFData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ordenes")
    .select(`
      id, numero, fecha_salida, tecnico,
      moneda, aplica_iva, mostrar_cotizacion, cotizacion,
      marca, modelo, numero_serie, estacion, deficiencia, observaciones, empresa_id,
      clientes:cliente_id (
        razon_social, direccion, localidad, provincia, telefono1
      ),
      items_trabajo (
        cantidad, detalle, precio, importe
      )
    `)
    .eq("id", ordenId)
    .single();

  if (error || !data) return null;

  const { data: config } = await supabase
    .from("config")
    .select("nombre_empresa, direccion, cuit")
    .eq("empresa_id", data.empresa_id)
    .single();

  return {
    orden: {
      id: data.id,
      numero: data.numero,
      fecha_salida: data.fecha_salida,
      tecnico: data.tecnico,
      moneda: (data.moneda as string) ?? "USD",
      aplica_iva: (data.aplica_iva as boolean) ?? false,
      mostrar_cotizacion: (data.mostrar_cotizacion as boolean) ?? true,
      cotizacion: data.cotizacion as number | null,
      marca: data.marca,
      modelo: data.modelo,
      numero_serie: data.numero_serie,
      estacion: data.estacion,
      deficiencia: data.deficiencia,
      observaciones: data.observaciones,
    },
    cliente: data.clientes as RemitoPDFData["cliente"],
    items: (data.items_trabajo as RemitoPDFData["items"]) ?? [],
    config: config ?? null,
  };
}

// ─── Lista de órdenes pendientes (estado = ingresado) ────────
export async function getOrdenesIngresadas() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ordenes")
    .select(`
      id, numero, fecha_ingreso, marca, modelo,
      clientes:cliente_id ( razon_social )
    `)
    .eq("estado", "ingresado")
    .eq("activo", true)
    .order("numero", { ascending: false });
  return data ?? [];
}

// ─── Datos completos para la pantalla de salida ──────────────
export async function getOrdenParaSalida(ordenId: string) {
  const supabase = await createClient();

  const { data: orden } = await supabase
    .from("ordenes")
    .select(`
      id, numero, estado, marca, modelo, numero_serie,
      estacion, deficiencia, empresa_id, tecnico, fecha_ingreso, fecha_salida,
      moneda, aplica_iva, mostrar_cotizacion, cotizacion,
      clientes:cliente_id ( razon_social, telefono1, localidad )
    `)
    .eq("id", ordenId)
    .single();

  if (!orden) return null;

  const [{ data: config }, { data: tecnicos }, { data: items }] =
    await Promise.all([
      supabase
        .from("config")
        .select("cotizacion_dolar, iva")
        .eq("empresa_id", orden.empresa_id)
        .single(),
      supabase
        .from("tecnicos")
        .select("id, nombre")
        .eq("activo", true)
        .order("nombre"),
      supabase
        .from("items_trabajo")
        .select("cantidad, detalle, precio, importe")
        .eq("orden_id", ordenId)
        .order("created_at"),
    ]);

  return {
    orden: {
      id: orden.id,
      numero: orden.numero,
      estado: orden.estado,
      marca: orden.marca,
      modelo: orden.modelo,
      numero_serie: orden.numero_serie,
      estacion: orden.estacion,
      deficiencia: orden.deficiencia,
      tecnico: orden.tecnico,
      fecha_ingreso: orden.fecha_ingreso,
      fecha_salida: orden.fecha_salida,
      moneda: orden.moneda ?? "USD",
      aplica_iva: orden.aplica_iva ?? false,
      mostrar_cotizacion: orden.mostrar_cotizacion ?? true,
      cotizacion: orden.cotizacion ?? null,
      cliente: orden.clientes as {
        razon_social: string;
        telefono1: string | null;
        localidad: string | null;
      },
    },
    config: config ?? null,
    tecnicos: tecnicos ?? [],
    items: items ?? [],
  };
}

// ─── Confirmar entrega de equipo (atómico via RPC) ───────────
export async function confirmarSalida(
  ordenId: string,
  tecnico: string,
  items: { cantidad: number; detalle: string; precio: number; importe: number }[],
  opciones: {
    moneda: string;
    aplica_iva: boolean;
    mostrar_cotizacion: boolean;
    cotizacion: number | null;
  },
  // Al EDITAR una salida ya registrada, preservar la fecha original.
  // Al registrar por primera vez, usar hoy.
  fechaSalida?: string | null
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Atómico: items + estado/fecha/técnico
  const { error } = await supabase.rpc("confirmar_salida_orden", {
    p_orden_id:     ordenId,
    p_tecnico:      tecnico,
    p_fecha_salida: fechaSalida || today,
    p_items:        items,
  });

  if (error) return { error: error.message };

  // Guardar opciones de facturación (moneda, IVA, cotización)
  await supabase
    .from("ordenes")
    .update({
      moneda:             opciones.moneda,
      aplica_iva:         opciones.aplica_iva,
      mostrar_cotizacion: opciones.mostrar_cotizacion,
      cotizacion:         opciones.cotizacion,
    })
    .eq("id", ordenId);

  revalidatePath("/ordenes");
  revalidatePath(`/ordenes/${ordenId}`);
  revalidatePath(`/ordenes/${ordenId}/salida`);

  return { success: true };
}

// ─── Revertir una salida ya registrada ───────────────────────
// Vuelve la orden a 'ingresado', limpia la fecha de salida y borra
// los ítems de trabajo. La orden vuelve a quedar pendiente de entrega.
export async function revertirSalida(
  ordenId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();

  const { error: itemsError } = await supabase
    .from("items_trabajo")
    .delete()
    .eq("orden_id", ordenId);
  if (itemsError) return { error: itemsError.message };

  const { error: ordenError } = await supabase
    .from("ordenes")
    .update({ estado: "ingresado", fecha_salida: null })
    .eq("id", ordenId);
  if (ordenError) return { error: ordenError.message };

  revalidatePath("/ordenes");
  revalidatePath(`/ordenes/${ordenId}/salida`);
  return { success: true };
}
