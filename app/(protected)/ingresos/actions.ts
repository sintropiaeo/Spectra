"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Tables } from "@/lib/database.types";

// ─── Tipos ───────────────────────────────────────────────────
// numero/orden_id solo vienen al CREAR; al EDITAR el success viene sin ellos.
export type IngresoState =
  | { success: true; numero?: number; orden_id?: string }
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

// ─── Cargar una entrada para editar ──────────────────────────
export type IngresoEdit = {
  id: string;
  numero: number;
  cliente: { id: string; razon_social: string } | null;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;
  estacion: string | null;
  deficiencia: string | null;
  observaciones: string | null;
  entrego: string | null;
  quien_recibio: string | null;
  tecnico: string | null;
  fecha_ingreso: string;
  accesorios: {
    microfono: boolean;
    fuente: boolean;
    cable: boolean;
    pack: boolean;
    antena: boolean;
    cargador: boolean;
    crem: boolean;
  };
};

const ACC_KEYS = [
  "microfono",
  "fuente",
  "cable",
  "pack",
  "antena",
  "cargador",
  "crem",
] as const;

export async function getIngresoParaEditar(
  id: string
): Promise<IngresoEdit | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ordenes")
    .select(`
      id, numero, cliente_id, marca, modelo, numero_serie, estacion,
      deficiencia, observaciones, entrego, quien_recibio, tecnico, fecha_ingreso,
      clientes:cliente_id ( id, razon_social ),
      accesorios_orden ( microfono, fuente, cable, pack, antena, cargador, crem )
    `)
    .eq("id", id)
    .eq("activo", true)
    .single();

  if (!data) return null;

  // accesorios_orden es 1:1; PostgREST puede devolver objeto o arreglo
  const accRaw = Array.isArray(data.accesorios_orden)
    ? data.accesorios_orden[0]
    : data.accesorios_orden;
  const accesorios = ACC_KEYS.reduce(
    (acc, k) => ({ ...acc, [k]: !!(accRaw as Record<string, boolean>)?.[k] }),
    {} as IngresoEdit["accesorios"]
  );

  const cli = Array.isArray(data.clientes) ? data.clientes[0] : data.clientes;

  return {
    id: data.id,
    numero: data.numero,
    cliente: cli ? { id: cli.id, razon_social: cli.razon_social } : null,
    marca: data.marca,
    modelo: data.modelo,
    numero_serie: data.numero_serie,
    estacion: data.estacion,
    deficiencia: data.deficiencia,
    observaciones: data.observaciones,
    entrego: data.entrego,
    quien_recibio: data.quien_recibio,
    tecnico: data.tecnico,
    fecha_ingreso: data.fecha_ingreso,
    accesorios,
  };
}

// ─── Actualizar una entrada (mismos campos que el alta) ──────
export async function updateIngreso(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<IngresoState> {
  const cliente_id = (formData.get("cliente_id") as string)?.trim();
  if (!cliente_id) return { error: "Seleccioná un cliente." };

  const fecha = (formData.get("fecha_ingreso") as string)?.trim();
  if (!fecha) return { error: "La fecha de ingreso es obligatoria." };

  const s = (k: string) => {
    const v = (formData.get(k) as string)?.trim();
    return v || null;
  };

  try {
    const supabase = await createClient();

    const { error: ordenError } = await supabase
      .from("ordenes")
      .update({
        cliente_id,
        marca: s("marca"),
        modelo: s("modelo"),
        numero_serie: s("numero_serie"),
        estacion: s("estacion"),
        deficiencia: s("deficiencia"),
        observaciones: s("observaciones"),
        entrego: s("entrego"),
        quien_recibio: s("quien_recibio"),
        tecnico: s("tecnico"),
        fecha_ingreso: fecha,
      })
      .eq("id", id);

    if (ordenError) return { error: ordenError.message };

    const { error: accError } = await supabase.from("accesorios_orden").upsert(
      {
        orden_id: id,
        microfono: formData.get("microfono") === "on",
        fuente: formData.get("fuente") === "on",
        cable: formData.get("cable") === "on",
        pack: formData.get("pack") === "on",
        antena: formData.get("antena") === "on",
        cargador: formData.get("cargador") === "on",
        crem: formData.get("crem") === "on",
      },
      { onConflict: "orden_id" }
    );

    if (accError) return { error: accError.message };

    revalidatePath("/ingresos");
    revalidatePath(`/ingresos/${id}/editar`);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ─── Eliminar (borrado lógico: activo = false) ───────────────
export async function deleteIngreso(id: string) {
  const supabase = await createClient();
  await supabase.from("ordenes").update({ activo: false }).eq("id", id);
  revalidatePath("/ingresos");
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
