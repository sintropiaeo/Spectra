"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RemitoItem } from "@/lib/remitoPrintConfig";

export type RemitoState =
  | { error: string }
  | { success: true; id: string }
  | null;

function str(formData: FormData, key: string): string | null {
  const val = (formData.get(key) as string)?.trim();
  return val || null;
}

async function resolveEmpresaId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("empresa_id")
    .eq("id", user.id)
    .single();

  if (perfil?.empresa_id)
    return { supabase, empresa_id: perfil.empresa_id, userId: user.id };

  // superadmin: usar la única empresa existente por ahora
  const { data: empresa } = await supabase
    .from("empresas")
    .select("id")
    .limit(1)
    .single();

  if (!empresa)
    throw new Error("No hay empresas registradas. Creá una desde Supabase.");
  return { supabase, empresa_id: empresa.id, userId: user.id };
}

function parseItems(formData: FormData): RemitoItem[] {
  const raw = formData.get("items");
  if (typeof raw !== "string") return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .map((it) => ({
        cantidad: String((it as RemitoItem)?.cantidad ?? "").trim(),
        detalle: String((it as RemitoItem)?.detalle ?? "").trim(),
      }))
      .filter((it) => it.cantidad || it.detalle);
  } catch {
    return [];
  }
}

function buildPayload(formData: FormData) {
  const hoy = new Date().toISOString().slice(0, 10);
  return {
    cliente_id: str(formData, "cliente_id"),
    razon_social: str(formData, "razon_social"),
    domicilio: str(formData, "domicilio"),
    condicion_iva: str(formData, "condicion_iva"),
    cuit: str(formData, "cuit"),
    fecha: str(formData, "fecha") ?? hoy,
    numero_fisico: str(formData, "numero_fisico"),
    items: parseItems(formData),
  };
}

export async function createRemito(
  _prev: unknown,
  formData: FormData
): Promise<RemitoState> {
  try {
    const { supabase, empresa_id, userId } = await resolveEmpresaId();

    const { data, error } = await supabase
      .from("remitos_manuales")
      .insert({ empresa_id, created_by: userId, ...buildPayload(formData) })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/remitos");
    return { success: true, id: data.id };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function updateRemito(
  id: string,
  _prev: unknown,
  formData: FormData
): Promise<RemitoState> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("remitos_manuales")
      .update(buildPayload(formData))
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/remitos");
    revalidatePath(`/remitos/${id}/editar`);
    return { success: true, id };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function deleteRemito(id: string) {
  const supabase = await createClient();
  await supabase.from("remitos_manuales").delete().eq("id", id);
  revalidatePath("/remitos");
}

// Datos para el PDF de impresión. IMPORTANTE: nunca se incluye
// numero_fisico — ese número ya viene impreso en el papel.
export type RemitoImpresion = {
  razon_social: string | null;
  domicilio: string | null;
  condicion_iva: string | null;
  cuit: string | null;
  fecha: string;
  items: RemitoItem[];
};

export async function getRemitoParaImpresion(
  id: string
): Promise<RemitoImpresion | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("remitos_manuales")
    .select("razon_social, domicilio, condicion_iva, cuit, fecha, items")
    .eq("id", id)
    .single();

  if (!data) return null;

  const items = Array.isArray(data.items)
    ? (data.items as unknown as RemitoItem[])
    : [];

  return {
    razon_social: data.razon_social,
    domicilio: data.domicilio,
    condicion_iva: data.condicion_iva,
    cuit: data.cuit,
    fecha: data.fecha,
    items,
  };
}
