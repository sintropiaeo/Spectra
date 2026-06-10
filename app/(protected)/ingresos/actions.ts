"use server";

import { createClient } from "@/lib/supabase/server";
import { Tables } from "@/lib/database.types";

// ─── Tipos ───────────────────────────────────────────────────
export type IngresoState =
  | { success: true; numero: number; orden_id: string }
  | { error: string }
  | null;

export type ClienteRapidoState =
  | { cliente: Tables<"clientes"> }
  | { error: string }
  | null;

// ─── Helper compartido ───────────────────────────────────────
async function getEmpresaId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("empresa_id")
    .eq("id", user.id)
    .single();

  if (perfil?.empresa_id) return { supabase, empresa_id: perfil.empresa_id };

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id")
    .limit(1)
    .single();

  if (!empresa) throw new Error("No hay empresas registradas.");
  return { supabase, empresa_id: empresa.id };
}

// ─── Crear ingreso (orden + accesorios, atómico via RPC) ─────
export async function createIngreso(
  _prev: unknown,
  formData: FormData
): Promise<IngresoState> {
  const cliente_id = (formData.get("cliente_id") as string)?.trim();
  if (!cliente_id) return { error: "Seleccioná un cliente." };

  const fecha = (formData.get("fecha_ingreso") as string)?.trim();
  if (!fecha) return { error: "La fecha de ingreso es obligatoria." };

  try {
    const { supabase, empresa_id } = await getEmpresaId();

    const { data, error } = await supabase.rpc("crear_orden_con_accesorios", {
      p_empresa_id:    empresa_id,
      p_cliente_id:    cliente_id,
      p_marca:         (formData.get("marca")         as string) ?? "",
      p_modelo:        (formData.get("modelo")        as string) ?? "",
      p_numero_serie:  (formData.get("numero_serie")  as string) ?? "",
      p_estacion:      (formData.get("estacion")      as string) ?? "",
      p_deficiencia:   (formData.get("deficiencia")   as string) ?? "",
      p_observaciones: (formData.get("observaciones") as string) ?? "",
      p_entrego:       (formData.get("entrego")       as string) ?? "",
      p_quien_recibio: (formData.get("quien_recibio") as string) ?? "",
      p_tecnico:       (formData.get("tecnico")       as string) ?? "",
      p_fecha_ingreso: fecha,
      p_microfono:  formData.get("microfono")  === "on",
      p_fuente:     formData.get("fuente")     === "on",
      p_cable:      formData.get("cable")      === "on",
      p_pack:       formData.get("pack")       === "on",
      p_antena:     formData.get("antena")     === "on",
      p_cargador:   formData.get("cargador")   === "on",
      p_crem:       formData.get("crem")       === "on",
    });

    if (error) return { error: error.message };

    const result = data as { orden_id: string; numero: number };
    return { success: true, numero: result.numero, orden_id: result.orden_id };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ─── Crear cliente rápido desde el modal (no redirige) ───────
export async function createClienteRapido(
  _prev: unknown,
  formData: FormData
): Promise<ClienteRapidoState> {
  const razon_social = (formData.get("razon_social") as string)?.trim();
  if (!razon_social) return { error: "La razón social es obligatoria." };

  try {
    const { supabase, empresa_id } = await getEmpresaId();

    const { data, error } = await supabase
      .from("clientes")
      .insert({
        empresa_id,
        razon_social,
        telefono1: (formData.get("telefono1") as string)?.trim() || null,
        contacto:  (formData.get("contacto")  as string)?.trim() || null,
        localidad: (formData.get("localidad") as string)?.trim() || null,
      })
      .select()
      .single();

    if (error) return { error: error.message };
    return { cliente: data };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
